using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using System.Threading.Tasks;
using System;

namespace TMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileUploadController : ControllerBase
    {
        private readonly string _uploadPath;
        private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".xlsx", ".xls" };
        private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB

        public FileUploadController()
        {
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            
            // Create uploads directory if it doesn't exist
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                // Validate file size
                if (file.Length > _maxFileSize)
                {
                    return BadRequest(new { message = "File size exceeds 10MB limit" });
                }

                // Validate file extension
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, XLSX, XLS" });
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(_uploadPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return file info
                var fileUrl = $"/uploads/{fileName}";
                var fileInfo = new
                {
                    fileName = file.FileName,
                    savedFileName = fileName,
                    fileUrl = fileUrl,
                    fileSize = file.Length,
                    fileType = file.ContentType,
                    uploadedAt = DateTime.UtcNow
                };

                return Ok(new { 
                    success = true, 
                    message = "File uploaded successfully",
                    data = fileInfo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Error uploading file", 
                    error = ex.Message 
                });
            }
        }

        [HttpPost("upload-multiple")]
        public async Task<IActionResult> UploadMultipleFiles(IFormFileCollection files)
        {
            try
            {
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { message = "No files uploaded" });
                }

                var uploadedFiles = new List<object>();

                foreach (var file in files)
                {
                    if (file.Length == 0) continue;

                    // Validate file size
                    if (file.Length > _maxFileSize)
                    {
                        return BadRequest(new { message = $"File {file.FileName} exceeds 10MB limit" });
                    }

                    // Validate file extension
                    var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!_allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest(new { message = $"File type {fileExtension} not allowed for {file.FileName}" });
                    }

                    // Generate unique filename
                    var fileName = $"{Guid.NewGuid()}{fileExtension}";
                    var filePath = Path.Combine(_uploadPath, fileName);

                    // Save file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var fileUrl = $"/uploads/{fileName}";
                    uploadedFiles.Add(new
                    {
                        fileName = file.FileName,
                        savedFileName = fileName,
                        fileUrl = fileUrl,
                        fileSize = file.Length,
                        fileType = file.ContentType,
                        uploadedAt = DateTime.UtcNow
                    });
                }

                return Ok(new { 
                    success = true, 
                    message = $"{uploadedFiles.Count} files uploaded successfully",
                    data = uploadedFiles
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Error uploading files", 
                    error = ex.Message 
                });
            }
        }

        [HttpGet("download/{fileName}")]
        public IActionResult DownloadFile(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_uploadPath, fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "File not found" });
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Error downloading file", 
                    error = ex.Message 
                });
            }
        }

        [HttpDelete("delete/{fileName}")]
        public IActionResult DeleteFile(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_uploadPath, fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "File not found" });
                }

                System.IO.File.Delete(filePath);

                return Ok(new { 
                    success = true, 
                    message = "File deleted successfully" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Error deleting file", 
                    error = ex.Message 
                });
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xls" => "application/vnd.ms-excel",
                _ => "application/octet-stream"
            };
        }
    }
}
