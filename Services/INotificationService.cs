// Services/INotificationService.cs
namespace UniProject.Services
{
    public interface INotificationService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
        Task SendSmsAsync(string toPhoneNumber, string message);
    }
}