namespace TMS.Core.Enums;

public enum PaymentMethod
{
    BankTransfer = 0,   // حوالة بنكية
    Check = 1,          // شيك
    Cash = 2,           // نقداً
    CreditCard = 3,     // بطاقة ائتمان
    OnlinePayment = 4,  // دفع إلكتروني
    LetterOfCredit = 5  // اعتماد مستندي
}

