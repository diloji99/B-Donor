// Services/CompositeNotificationService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;


namespace UniProject.Services
{
    public class CompositeNotificationService : INotificationService
    {
        private readonly EmailNotificationService _emailService;
        private readonly SmsNotificationService _smsService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CompositeNotificationService> _logger;

        public CompositeNotificationService(
            EmailNotificationService emailService,
            SmsNotificationService smsService,
            ApplicationDbContext context,
            ILogger<CompositeNotificationService> logger)
        {
            _emailService = emailService;
            _smsService = smsService;
            _context = context;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            await _emailService.SendEmailAsync(toEmail, subject, message);
        }

        public async Task SendSmsAsync(string toPhoneNumber, string message)
        {
            await _smsService.SendSmsAsync(toPhoneNumber, message);
        }

        public async Task SendBothAsync(string toEmail, string toPhoneNumber, string subject, string emailMessage, string smsMessage)
        {
            var tasks = new List<Task>();

            // Get donor preferences
            var donor = await _context.Donors
                .FirstOrDefaultAsync(d => d.Email == toEmail || d.PhoneNumber == toPhoneNumber);

            if (donor != null)
            {
                var preferences = await _context.NotificationPreferences
                    .FirstOrDefaultAsync(p => p.DonorId == donor.Id);

                if (preferences != null)
                {
                    if (preferences.ReceiveEmail && preferences.EmergencyAlerts)
                    {
                        tasks.Add(_emailService.SendEmailAsync(toEmail, subject, emailMessage));
                    }

                    if (preferences.ReceiveSms && preferences.EmergencyAlerts)
                    {
                        // SMS has character limit, use shortened message
                        var shortSmsMessage = smsMessage.Length > 160
                            ? smsMessage.Substring(0, 157) + "..."
                            : smsMessage;
                        tasks.Add(_smsService.SendSmsAsync(toPhoneNumber, shortSmsMessage));
                    }
                }
                else
                {
                    // If no preferences found, send both
                    tasks.Add(_emailService.SendEmailAsync(toEmail, subject, emailMessage));

                    var shortSmsMessage = smsMessage.Length > 160
                        ? smsMessage.Substring(0, 157) + "..."
                        : smsMessage;
                    tasks.Add(_smsService.SendSmsAsync(toPhoneNumber, shortSmsMessage));
                }
            }
            else
            {
                // Fallback: send both if donor not found
                tasks.Add(_emailService.SendEmailAsync(toEmail, subject, emailMessage));

                var shortSmsMessage = smsMessage.Length > 160
                    ? smsMessage.Substring(0, 157) + "..."
                    : smsMessage;
                tasks.Add(_smsService.SendSmsAsync(toPhoneNumber, shortSmsMessage));
            }

            await Task.WhenAll(tasks);
        }
    }
}