import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, User, Phone, CheckCircle2, Ticket, Tag, Calculator } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { Event } from '@/types';
import { Loader } from './Loader';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  quantity: z.number().min(1, 'At least 1 ticket required').max(10, 'Maximum 10 tickets per order'),
  discountCode: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const DISCOUNT_CODES: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  'SAVE10': { discount: 10, type: 'percentage' },
  'SAVE20': { discount: 20, type: 'percentage' },
  'WELCOME': { discount: 15, type: 'percentage' },
  'EARLYBIRD': { discount: 25, type: 'percentage' },
  'FREETICKET': { discount: 5, type: 'fixed' },
  'STUDENT': { discount: 10, type: 'percentage' },
};

interface EventRegistrationModalProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventRegistrationModal = ({
  event,
  open,
  onOpenChange,
}: EventRegistrationModalProps) => {
  const { mutate: register, isPending } = useEventRegistration();
  const [discountError, setDiscountError] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      quantity: 1,
      discountCode: '',
    },
  });

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset({
        name: '',
        email: '',
        phone: '',
        quantity: 1,
        discountCode: '',
      });
      setAppliedDiscount(null);
      setDiscountError('');
      onOpenChange(false);
    }
  };

  const quantity = form.watch('quantity') || 1;
  const discountCode = form.watch('discountCode') || '';
  const eventPrice = event.price ?? 0;

  const priceBreakdown = useMemo(() => {
    const subtotal = eventPrice * quantity;
    let discountAmount = 0;
    
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        discountAmount = (subtotal * appliedDiscount.discount) / 100;
      } else {
        discountAmount = Math.min(appliedDiscount.discount * quantity, subtotal);
      }
    }
    
    const total = Math.max(0, subtotal - discountAmount);
    
    return {
      subtotal,
      discountAmount,
      total,
      pricePerTicket: eventPrice,
    };
  }, [eventPrice, quantity, appliedDiscount]);

  const handleDiscountCodeChange = (code: string) => {
    form.setValue('discountCode', code.toUpperCase());
    setDiscountError('');
    setAppliedDiscount(null);
    
    if (code.trim() === '') {
      return;
    }
    
    const upperCode = code.toUpperCase().trim();
    const discount = DISCOUNT_CODES[upperCode];
    
    if (discount) {
      setAppliedDiscount({ code: upperCode, ...discount });
      setDiscountError('');
    } else {
      setDiscountError('Invalid discount code');
    }
  };

  const handleApplyDiscount = () => {
    const code = discountCode.toUpperCase().trim();
    if (!code) {
      setDiscountError('Please enter a discount code');
      return;
    }
    
    const discount = DISCOUNT_CODES[code];
    if (discount) {
      setAppliedDiscount({ code, ...discount });
      setDiscountError('');
    } else {
      setDiscountError('Invalid discount code');
    }
  };

  const onSubmit = (values: RegistrationFormValues) => {
    register(
      {
        eventId: event.id,
        registration: {
          attendeeName: values.name,
          attendeeEmail: values.email,
          attendeePhone: values.phone,
          quantity: values.quantity,
          discountCode: appliedDiscount?.code || values.discountCode || undefined,
        },
        eventDetails: {
          title: event.title,
          date: event.date,
          location: event.location,
          price: event.price,
          quantity: values.quantity,
          discountCode: appliedDiscount?.code,
          discountAmount: priceBreakdown.discountAmount,
          subtotal: priceBreakdown.subtotal,
          total: priceBreakdown.total,
        },
      },
      {
        onSuccess: () => {
          form.reset({
            name: '',
            email: '',
            phone: '',
            quantity: 1,
            discountCode: '',
          });
          setAppliedDiscount(null);
          setDiscountError('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl">Register for Event</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Complete the form below to register for{' '}
            <span className="font-semibold text-foreground">{event.title}</span>
          </DialogDescription>
        </DialogHeader>

        <Separator className="flex-shrink-0" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 overflow-y-auto flex-1 pr-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your full name as it should appear on the registration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    We'll send a confirmation email to this address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: For event updates and reminders
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Number of Tickets *
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'ticket' : 'tickets'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select the number of tickets you'd like to purchase
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Discount Code
                  </FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter discount code"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            handleDiscountCodeChange(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyDiscount();
                            }
                          }}
                          className={cn(
                            "h-11 flex-1 uppercase",
                            appliedDiscount && "border-green-500",
                            discountError && "border-red-500"
                          )}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={!discountCode.trim()}
                        className="shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
                    {appliedDiscount && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          ✓ {appliedDiscount.code} Applied
                        </Badge>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {appliedDiscount.type === 'percentage'
                            ? `${appliedDiscount.discount}% off`
                            : `$${appliedDiscount.discount} off`}
                        </span>
                      </div>
                    )}
                    {discountError && (
                      <p className="text-sm text-destructive">{discountError}</p>
                    )}
                    <FormDescription>
                      Optional: Enter a discount code to save on your purchase
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-2.5 sm:space-y-3 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price per ticket:</span>
                <span className="font-semibold">
                  {eventPrice === 0 ? 'Free' : `$${eventPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-semibold">{quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">${priceBreakdown.subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && priceBreakdown.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Discount ({appliedDiscount.code}):
                  </span>
                  <span className="font-semibold">-${priceBreakdown.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Total:
                </span>
                <span className="text-lg sm:text-xl font-bold text-primary">
                  {priceBreakdown.total === 0 ? 'Free' : `$${priceBreakdown.total.toFixed(2)}`}
                </span>
              </div>
            </div>

            <Separator className="flex-shrink-0" />

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 flex-shrink-0 sticky bottom-0 bg-background pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
                className="min-w-[100px] w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[120px] w-full sm:w-auto"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Register
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

