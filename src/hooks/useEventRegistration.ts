import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events';
import { EventRegistration } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { sendEmail } from '@/lib/emailjs';

export const useEventRegistration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      eventId,
      registration,
    }: {
      eventId: string;
      registration: EventRegistration;
    }) => eventsApi.register(eventId, registration),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });

      try {
        await sendEmail({
          to_name: variables.registration.attendeeName,
          to_email: variables.registration.attendeeEmail,
          subject: 'Event Registration Confirmation',
          message: `Thank you ${variables.registration.attendeeName} for registering for the event!`,
          event_name: variables.eventId,
        });
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
      }

      toast({
        title: 'Registration Successful!',
        description: data.message || 'You have successfully registered for this event.',
      });
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

