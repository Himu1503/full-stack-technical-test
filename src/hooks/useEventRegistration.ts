import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events';
import { EventRegistration } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { sendEmail } from '@/lib/emailjs';
import { logAction } from '@/lib/analytics';

export const useEventRegistration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      eventId,
      registration,
      eventDetails,
    }: {
      eventId: string;
      registration: EventRegistration;
      eventDetails?: {
        title: string;
        date: string;
        location?: string;
        price?: number;
      };
    }) => eventsApi.register(eventId, registration),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });

      logAction({
        action: 'register',
        resource: 'event',
        resourceId: variables.eventId,
        metadata: {
          attendeeName: variables.registration.attendeeName,
          attendeeEmail: variables.registration.attendeeEmail,
          registrationId: data.registrationId,
        },
      });

      const event = variables.eventDetails;
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      };

      const formatPrice = (price?: number | null): string => {
        if (price === undefined || price === null) {
          return 'Price not specified';
        }
        return price === 0 ? 'Free' : `$${price}`;
      };

      const emailMessage = event
        ? `Dear ${variables.registration.attendeeName},

Thank you for registering for "${event.title}"!

Event Details:
• Date & Time: ${formatDate(event.date)}
${event.location ? `• Location: ${event.location}` : '• Type: Online Event'}
• Price: ${formatPrice(event.price)}

We're excited to have you join us! A confirmation email has been sent to ${variables.registration.attendeeEmail}.

If you have any questions, please don't hesitate to contact us.

Best regards,
PulseEvents Team`
        : `Dear ${variables.registration.attendeeName},

Thank you for registering for the event!

We're excited to have you join us. A confirmation email has been sent to ${variables.registration.attendeeEmail}.

Best regards,
PulseEvents Team`;

      try {
        const formattedPrice = event ? formatPrice(event.price) : 'Price not specified';
        
        const emailParams = {
          to_name: variables.registration.attendeeName,
          to_email: variables.registration.attendeeEmail,
          subject: `Registration Confirmation - ${event?.title || 'Event'}`,
          message: emailMessage,
          event_name: event?.title || variables.eventId,
          event_title: event?.title,
          event_date: event ? formatDate(event.date) : '',
          event_location: event?.location || 'Online',
          event_price: formattedPrice,
          total_price: formattedPrice,
        };
        
        console.log('Sending email with params:', emailParams);
        
        await sendEmail(emailParams);

        const registrationInfo = data.registrationId 
          ? `Registration ID: ${data.registrationId}`
          : '';
        
        toast({
          title: 'Registration Successful! 🎉',
          description: `You've been registered! A confirmation email has been sent to ${variables.registration.attendeeEmail}. ${registrationInfo}`,
          duration: 6000,
        });
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        const registrationInfo = data.registrationId 
          ? ` Registration ID: ${data.registrationId}`
          : '';
        
        toast({
          title: 'Registration Successful!',
          description: `${data.message || 'You have successfully registered for this event. However, we encountered an issue sending the confirmation email.'}${registrationInfo}`,
          variant: 'default',
          duration: 6000,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register for the event. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

