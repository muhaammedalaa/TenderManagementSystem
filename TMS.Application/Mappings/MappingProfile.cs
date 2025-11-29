using AutoMapper;
using TMS.Application.DTOs.Address;
using TMS.Application.DTOs.AssignmentOrder;
using TMS.Application.DTOs.BankGuarantee;
using TMS.Application.DTOs.Common;
using TMS.Application.DTOs.Contract;
using TMS.Application.DTOs.Currency;
using TMS.Application.DTOs.Entity;
using TMS.Application.DTOs.Financial;
using TMS.Application.DTOs.GovernmentGuarantee;
using TMS.Application.DTOs.Notification;
using TMS.Application.DTOs.OperationLog;
using TMS.Application.DTOs.Quotation;
using TMS.Application.DTOs.Role;
using TMS.Application.DTOs.Supplier;
using TMS.Application.DTOs.SupplyDelivery;
using TMS.Application.DTOs.SupportMatter;
using TMS.Application.DTOs.Tender;
using TMS.Application.DTOs.TmsFile;
using TMS.Application.DTOs.User;
using TMS.Core.Entities;

namespace TMS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Base mapping
        CreateMap<Core.Common.BaseEntity, BaseDto>().ReverseMap();

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.Role.Name).ToList()));
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore());
        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore());

        // Role mappings
        CreateMap<Role, RoleDto>().ReverseMap();
        CreateMap<CreateRoleDto, Role>();

        // Entity mappings
        CreateMap<Entity, EntityDto>()
            .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parent != null ? src.Parent.Name : null))
            .ForMember(dest => dest.Children, opt => opt.MapFrom(src => src.Children));
        CreateMap<CreateEntityDto, Entity>();

        // Address mappings
        CreateMap<Address, AddressDto>().ReverseMap();
        CreateMap<CreateAddressDto, Address>();

        // Supplier mappings
        CreateMap<Supplier, SupplierDto>()
            .ForMember(dest => dest.Entity, opt => opt.MapFrom(src => src.Entity))
            .ForMember(dest => dest.PrimaryAddress, opt => opt.MapFrom(src => src.PrimaryAddress));
        CreateMap<CreateSupplierDto, Supplier>();

        // Currency mappings
        CreateMap<Currency, CurrencyDto>().ReverseMap();
        CreateMap<CreateCurrencyDto, Currency>();

        // Tender mappings
        CreateMap<Tender, TenderDto>()
            .ForMember(dest => dest.Entity, opt => opt.MapFrom(src => src.Entity))
            .ForMember(dest => dest.QuotationCount, opt => opt.MapFrom(src => src.Quotations.Count))
            .ForMember(dest => dest.Quotations, opt => opt.MapFrom(src => src.Quotations))
            .ForMember(dest => dest.WinnerQuotationId, opt => opt.MapFrom(src => src.WinnerQuotationId))
            .ForMember(dest => dest.AwardedDate, opt => opt.MapFrom(src => src.AwardedDate))
            .ForMember(dest => dest.AwardedBy, opt => opt.MapFrom(src => src.AwardedBy))
            .ForMember(dest => dest.AutoDetermineWinner, opt => opt.MapFrom(src => src.AutoDetermineWinner))
            .ForMember(dest => dest.WinnerDeterminationMethod, opt => opt.MapFrom(src => src.WinnerDeterminationMethod))
            .ForMember(dest => dest.LowestBidAmount, opt => opt.MapFrom(src => src.LowestBidAmount))
            .ForMember(dest => dest.LowestBidQuotationId, opt => opt.MapFrom(src => src.LowestBidQuotationId))
            .ForMember(dest => dest.HighestScore, opt => opt.MapFrom(src => src.HighestScore))
            .ForMember(dest => dest.HighestScoreQuotationId, opt => opt.MapFrom(src => src.HighestScoreQuotationId));
        CreateMap<CreateTenderDto, Tender>();

        // Quotation mappings
        CreateMap<Quotation, QuotationDto>()
            .ForMember(dest => dest.TenderTitle, opt => opt.MapFrom(src => src.Tender.Title))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier.Name))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency));
        CreateMap<CreateQuotationDto, Quotation>();

        // BankGuarantee mappings
        CreateMap<BankGuarantee, BankGuaranteeDto>()
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Quotation.Supplier.Name))
            .ForMember(dest => dest.TenderTitle, opt => opt.MapFrom(src => src.Quotation.Tender.Title))
            .ForMember(dest => dest.CurrencyName, opt => opt.MapFrom(src => src.Currency.Name));
        CreateMap<CreateBankGuaranteeDto, BankGuarantee>();

        // GovernmentGuarantee mappings
        CreateMap<GovernmentGuarantee, GovernmentGuaranteeDto>()
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Quotation.Supplier.Name))
            .ForMember(dest => dest.TenderTitle, opt => opt.MapFrom(src => src.Quotation.Tender.Title))
            .ForMember(dest => dest.CurrencyName, opt => opt.MapFrom(src => src.Currency.Name));
        CreateMap<CreateGovernmentGuaranteeDto, GovernmentGuarantee>();

        // Contract mappings
        CreateMap<Contract, ContractDto>()
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.AssignmentOrder != null ? src.AssignmentOrder.Quotation.Supplier.Name : null))
            .ForMember(dest => dest.TenderTitle, opt => opt.MapFrom(src => src.AssignmentOrder != null ? src.AssignmentOrder.Quotation.Tender.Title : null))
            .ForMember(dest => dest.CurrencyName, opt => opt.MapFrom(src => src.Currency.Name))
            .ForMember(dest => dest.AssignmentOrder, opt => opt.MapFrom(src => src.AssignmentOrder));
        CreateMap<CreateContractDto, Contract>();

        // AssignmentOrder mappings
        CreateMap<AssignmentOrder, AssignmentOrderDto>()
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Quotation.Supplier.Name))
            .ForMember(dest => dest.TenderTitle, opt => opt.MapFrom(src => src.Quotation.Tender.Title))
            .ForMember(dest => dest.EntityName, opt => opt.MapFrom(src => src.Entity.Name))
            .ForMember(dest => dest.CurrencyName, opt => opt.MapFrom(src => src.Currency.Name));
        CreateMap<CreateAssignmentOrderDto, AssignmentOrder>();

        // SupplyDelivery mappings
        CreateMap<SupplyDelivery, SupplyDeliveryDto>()
            .ForMember(dest => dest.ContractNumber, opt => opt.MapFrom(src => src.Contract.ContractNumber))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Contract.AssignmentOrder.Quotation.Supplier.Name))
            .ForMember(dest => dest.TenderTitle, opt => opt.MapFrom(src => src.Contract.AssignmentOrder.Quotation.Tender.Title));
        CreateMap<CreateSupplyDeliveryDto, SupplyDelivery>();

        // SupportMatter mappings
        CreateMap<SupportMatter, SupportMatterDto>()
            .ForMember(dest => dest.EntityName, opt => opt.MapFrom(src => src.Entity.Name));
        CreateMap<CreateSupportMatterDto, SupportMatter>();

        // Notification mappings
        CreateMap<Notification, NotificationDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FirstName + " " + src.User.LastName));
        CreateMap<CreateNotificationDto, Notification>();

        // OperationLog mappings
        CreateMap<OperationLog, OperationLogDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FirstName + " " + src.User.LastName));
        CreateMap<CreateOperationLogDto, OperationLog>();

        // TmsFile mappings
        CreateMap<TmsFile, TmsFileDto>().ReverseMap();

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.ContractNumber, opt => opt.MapFrom(src => src.Contract.ContractNumber))
            .ForMember(dest => dest.EntityName, opt => opt.MapFrom(src => src.Contract.AssignmentOrder.Entity.Name))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Contract.AssignmentOrder.Quotation.Supplier.Name));
        CreateMap<CreateInvoiceDto, Invoice>();
        CreateMap<UpdateInvoiceDto, Invoice>();

        // Payment mappings
        CreateMap<Payment, PaymentDto>()
            .ForMember(dest => dest.InvoiceNumber, opt => opt.MapFrom(src => src.Invoice.InvoiceNumber))
            .ForMember(dest => dest.ContractNumber, opt => opt.MapFrom(src => src.Invoice.Contract.ContractNumber))
            .ForMember(dest => dest.EntityName, opt => opt.MapFrom(src => src.Invoice.Contract.AssignmentOrder.Entity.Name))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Invoice.Contract.AssignmentOrder.Quotation.Supplier.Name));
        CreateMap<CreatePaymentDto, Payment>();
        CreateMap<UpdatePaymentDto, Payment>();

        // PaymentSchedule mappings
        CreateMap<PaymentSchedule, PaymentScheduleDto>()
            .ForMember(dest => dest.ContractNumber, opt => opt.MapFrom(src => src.Contract.ContractNumber));
        CreateMap<CreatePaymentScheduleDto, PaymentSchedule>();
        CreateMap<UpdatePaymentScheduleDto, PaymentSchedule>();
    }
}
