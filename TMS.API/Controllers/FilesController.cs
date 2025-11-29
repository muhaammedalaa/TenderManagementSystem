using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Application.DTOs.TmsFile;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _environment;

    public FilesController(TmsDbContext context, IMapper mapper, IWebHostEnvironment environment)
    {
        _context = context;
        _mapper = mapper;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TmsFileDto>>> GetFiles(
        Guid? entityId,
        string? entityType,
        bool? isPublic,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.TmsFiles
            .AsNoTracking();

        if (entityId.HasValue)
        {
            query = query.Where(f => f.EntityId == entityId.Value);
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            query = query.Where(f => f.EntityType == entityType);
        }

        if (isPublic.HasValue)
        {
            query = query.Where(f => f.IsPublic == isPublic.Value);
        }

        var totalCount = await query.CountAsync();
        var files = await query
            .OrderByDescending(f => f.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var fileDtos = _mapper.Map<IEnumerable<TmsFileDto>>(files);

        return Ok(new
        {
            data = fileDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TmsFileDto>> GetFile(Guid id)
    {
        var file = await _context.TmsFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id);

        if (file == null)
            return NotFound();

        var fileDto = _mapper.Map<TmsFileDto>(file);
        return Ok(fileDto);
    }

    [HttpGet("entity/{entityId:guid}")]
    public async Task<ActionResult<IEnumerable<TmsFileDto>>> GetFilesByEntity(Guid entityId)
    {
        var files = await _context.TmsFiles
            .Where(f => f.EntityId == entityId)
            .OrderByDescending(f => f.CreatedAtUtc)
            .ToListAsync();

        var fileDtos = _mapper.Map<IEnumerable<TmsFileDto>>(files);
        return Ok(fileDtos);
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TmsFileDto>> UploadFile(
        IFormFile file,
        Guid entityId,
        string entityType,
        string? description,
        bool isPublic = false)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }

        // Validate file size (10MB limit)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File size exceeds 10MB limit");
        }

        // Validate file type
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".txt" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest($"File type {fileExtension} is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == entityId))
        {
            return BadRequest($"Entity with ID {entityId} does not exist");
        }

        // Create uploads directory if it doesn't exist
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create file record
        var fileRecord = new TmsFile
        {
            EntityId = entityId,
            EntityType = entityType,
            FileName = fileName,
            OriginalFileName = file.FileName,
            FilePath = filePath,
            FileType = fileExtension,
            FileSize = file.Length,
            MimeType = file.ContentType,
            Description = description,
            IsPublic = isPublic,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.TmsFiles.Add(fileRecord);
        await _context.SaveChangesAsync();

        var fileDto = _mapper.Map<TmsFileDto>(fileRecord);
        return CreatedAtAction(nameof(GetFile), new { id = fileRecord.Id }, fileDto);
    }

    [HttpPost("upload-pdf")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TmsFileDto>> UploadPdfFile(
        IFormFile file,
        Guid entityId,
        string entityType,
        string? description,
        bool isPublic = false)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }

        // Validate file size (20MB limit for PDFs)
        if (file.Length > 20 * 1024 * 1024)
        {
            return BadRequest("PDF file size exceeds 20MB limit");
        }

        // Validate PDF file
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (fileExtension != ".pdf")
        {
            return BadRequest("Only PDF files are allowed for this endpoint");
        }

        if (!IsValidPdfFile(file))
        {
            return BadRequest("Invalid PDF file or corrupted content");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == entityId))
        {
            return BadRequest($"Entity with ID {entityId} does not exist");
        }

        // Create uploads directory if it doesn't exist
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "pdfs");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}.pdf";
        var filePath = Path.Combine(uploadsPath, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create file record
        var fileRecord = new TmsFile
        {
            EntityId = entityId,
            EntityType = entityType,
            FileName = fileName,
            OriginalFileName = file.FileName,
            FilePath = filePath,
            FileType = ".pdf",
            FileSize = file.Length,
            MimeType = "application/pdf",
            Description = description,
            IsPublic = isPublic,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.TmsFiles.Add(fileRecord);
        await _context.SaveChangesAsync();

        var fileDto = _mapper.Map<TmsFileDto>(fileRecord);
        return CreatedAtAction(nameof(GetFile), new { id = fileRecord.Id }, fileDto);
    }

    [HttpGet("download/{id:guid}")]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
        var file = await _context.TmsFiles.FindAsync(id);
        if (file == null)
            return NotFound();

        if (!System.IO.File.Exists(file.FilePath))
        {
            return NotFound("File not found on disk");
        }

        var fileBytes = await System.IO.File.ReadAllBytesAsync(file.FilePath);
        return File(fileBytes, file.MimeType ?? "application/octet-stream", file.OriginalFileName);
    }

    [HttpGet("pdf/{id:guid}")]
    public async Task<IActionResult> DownloadPdf(Guid id)
    {
        var file = await _context.TmsFiles.FindAsync(id);
        if (file == null)
            return NotFound();

        if (file.FileType != ".pdf")
        {
            return BadRequest("File is not a PDF");
        }

        if (!System.IO.File.Exists(file.FilePath))
        {
            return NotFound("PDF file not found on disk");
        }

        var fileBytes = await System.IO.File.ReadAllBytesAsync(file.FilePath);
        return File(fileBytes, "application/pdf", file.OriginalFileName);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFile(Guid id)
    {
        var file = await _context.TmsFiles.FindAsync(id);
        if (file == null)
            return NotFound();

        // Delete physical file
        if (System.IO.File.Exists(file.FilePath))
        {
            System.IO.File.Delete(file.FilePath);
        }

        _context.TmsFiles.Remove(file);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("batch-upload")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BatchUploadResult>> BatchUpload([FromForm] BatchUploadRequest request)
    {
        var results = new List<FileUploadResult>();
        var errors = new List<string>();

        if (request.Files == null || !request.Files.Any())
        {
            return BadRequest("No files provided");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == request.EntityId))
        {
            return BadRequest($"Entity with ID {request.EntityId} does not exist");
        }

        // Create uploads directory if it doesn't exist
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        foreach (var file in request.Files)
        {
            try
            {
                if (file.Length == 0)
                {
                    errors.Add($"File {file.FileName} is empty");
                    continue;
                }

                // Validate file size (10MB limit)
                if (file.Length > 10 * 1024 * 1024)
                {
                    errors.Add($"File {file.FileName} exceeds 10MB limit");
                    continue;
                }

                // Validate file type
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".txt" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    errors.Add($"File {file.FileName} has unsupported type {fileExtension}");
                    continue;
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create file record
                var fileRecord = new TmsFile
                {
                    EntityId = request.EntityId,
                    EntityType = request.EntityType,
                    FileName = fileName,
                    OriginalFileName = file.FileName,
                    FilePath = filePath,
                    FileType = fileExtension,
                    FileSize = file.Length,
                    MimeType = file.ContentType,
                    Description = request.Description,
                    IsPublic = request.IsPublic,
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                };

                _context.TmsFiles.Add(fileRecord);
                await _context.SaveChangesAsync();

                results.Add(new FileUploadResult(
                    file.FileName,
                    fileRecord.Id,
                    true,
                    "File uploaded successfully"
                ));
            }
            catch (Exception ex)
            {
                errors.Add($"Error uploading {file.FileName}: {ex.Message}");
                results.Add(new FileUploadResult(
                    file.FileName,
                    null,
                    false,
                    ex.Message
                ));
            }
        }

        return Ok(new BatchUploadResult(
            request.Files.Count(),
            results.Count(r => r.Success),
            results.Count(r => !r.Success),
            results,
            errors
        ));
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetFileStatistics()
    {
        var totalFiles = await _context.TmsFiles.CountAsync();
        var totalSize = await _context.TmsFiles.SumAsync(f => f.FileSize);
        var averageSize = await _context.TmsFiles.AverageAsync(f => f.FileSize);

        var filesByType = await _context.TmsFiles
            .GroupBy(f => f.FileType)
            .Select(g => new
            {
                fileType = g.Key,
                count = g.Count(),
                totalSize = g.Sum(f => f.FileSize)
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var filesByEntityType = await _context.TmsFiles
            .GroupBy(f => f.EntityType)
            .Select(g => new
            {
                entityType = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var statistics = new
        {
            totalFiles,
            totalSize,
            averageSize,
            filesByType,
            filesByEntityType
        };

        return Ok(statistics);
    }

    private bool IsValidPdfFile(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            using var reader = new BinaryReader(stream);
            
            // Read first 4 bytes to check PDF signature
            var header = reader.ReadBytes(4);
            var headerString = System.Text.Encoding.ASCII.GetString(header);
            
            // PDF files start with "%PDF"
            return headerString.StartsWith("%PDF");
        }
        catch
        {
            return false;
        }
    }
}

// DTOs
public record BatchUploadRequest(
    Guid EntityId,
    string EntityType,
    string? Description,
    bool IsPublic,
    IFormFileCollection Files);

public record FileUploadResult(
    string FileName,
    Guid? FileId = null,
    bool Success = false,
    string Message = "");

public record BatchUploadResult(
    int TotalFiles,
    int SuccessfulUploads,
    int FailedUploads,
    List<FileUploadResult> Results,
    List<string> Errors);
