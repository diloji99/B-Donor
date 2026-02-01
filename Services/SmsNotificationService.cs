// Services/SmsNotificationService.cs
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using UniProject.Dtos;


namespace UniProject.Services
{
    public class SmsNotificationService : INotificationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmsNotificationService> _logger;
        private readonly ApplicationDbContext _context;

        public SmsNotificationService(
            IConfiguration configuration,
            ILogger<SmsNotificationService> logger,
            ApplicationDbContext context)
        {
            _configuration = configuration;
            _logger = logger;
            _context = context;
        }

        public Task SendEmailAsync(string toEmail, string subject, string message)
        {
            // This service only handles SMS
            return Task.CompletedTask;
        }

        public async Task SendSmsAsync(string toPhoneNumber, string message)
        {
            try
            {
                var smsSettings = _configuration.GetSection("SmsSettings");

                TwilioClient.Init(smsSettings["AccountSid"], smsSettings["AuthToken"]);

                var smsMessage = await MessageResource.CreateAsync(
                    body: message,
                    from: new PhoneNumber(smsSettings["FromPhoneNumber"]),
                    to: new PhoneNumber(toPhoneNumber)
                );

                // Log successful SMS
                await LogNotification(toPhoneNumber, "SMS", "SMS Alert", "Sent", null);

                _logger.LogInformation($"SMS sent to {toPhoneNumber}, SID: {smsMessage.Sid}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send SMS to {toPhoneNumber}: {ex.Message}");

                // Log failed SMS
                await LogNotification(toPhoneNumber, "SMS", "SMS Alert", "Failed", ex.Message);
                throw;
            }
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