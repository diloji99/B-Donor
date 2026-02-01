// Services/EmailNotificationService.cs
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using UniProject.Dtos;


namespace UniProject.Services
{
    public class EmailNotificationService : INotificationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailNotificationService> _logger;
        private readonly ApplicationDbContext _context;

        public EmailNotificationService(
            IConfiguration configuration,
            ILogger<EmailNotificationService> logger,
            ApplicationDbContext context)
        {
            _configuration = configuration;
            _logger = logger;
            _context = context;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");

                using var smtpClient = new SmtpClient(emailSettings["SmtpServer"])
                {
                    Port = int.Parse(emailSettings["SmtpPort"]),
                    Credentials = new NetworkCredential(
                        emailSettings["Username"],
                        emailSettings["Password"]),
                    EnableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true"),
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(
                        emailSettings["SenderEmail"]!,
                        emailSettings["SenderName"]),
                    Subject = subject,
                    Body = message,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage);

                // Log successful email
                await LogNotification(toEmail, "Email", subject, "Sent", null);

                _logger.LogInformation($"Email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send email to {toEmail}: {ex.Message}");

                // Log failed email
                await LogNotification(toEmail, "Email", subject, "Failed", ex.Message);
                throw;
            }
        }

        public Task SendSmsAsync(string toPhoneNumber, string message)
        {
            // This service only handles email
            return Task.CompletedTask;
        }

        private async Task LogNotification(string recipient, string type, string subject, string status, string? error)
        {
            var log = new NotificationLog
            {
                Recipient = recipient,
                Type = type,
                Subject = subject,
                Status = status,
                SentAt = DateTime.Now,
                ErrorMessage = error
            };

            await _context.NotificationLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }
    }
}