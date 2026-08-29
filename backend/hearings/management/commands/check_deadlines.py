from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from django.contrib.auth import get_user_model
from hearings.models import Deadline, Hearing
from notifications.models import Notification

User = get_user_model()


class Command(BaseCommand):
    help = 'Check for overdue deadlines and upcoming hearings, send notifications'

    def handle(self, *args, **options):
        now = timezone.now()
        today = now.date()
        self.stdout.write(f"Running deadline check at {now}")

        # Check deadlines
        self.check_deadlines(now, today)

        # Check hearings within 48 hours
        self.check_hearings(now)

        self.stdout.write(self.style.SUCCESS('Deadline check completed'))

    def check_deadlines(self, now, today):
        """Check for unresolved deadlines that are due today or overdue"""
        # Find unresolved deadlines where due_date is today or in the past
        deadlines = Deadline.objects.filter(
            is_resolved=False,
            due_date__lte=now
        ).select_related('case', 'case__assigned_officer')

        notified_count = 0
        for deadline in deadlines:
            # Check if already notified today
            if deadline.last_notified_at and deadline.last_notified_at.date() == today:
                continue

            # Determine if overdue or due today
            due_date = deadline.due_date.date()
            if due_date < today:
                message = f"Deadline '{deadline.description}' for case {deadline.case.case_id} is OVERDUE (was due {due_date})"
                is_overdue = True
            else:
                message = f"Deadline '{deadline.description}' for case {deadline.case.case_id} is due TODAY ({due_date})"
                is_overdue = False

            # Notify assigned officer if exists, otherwise notify head users
            if deadline.case.assigned_officer:
                Notification.objects.create(
                    recipient=deadline.case.assigned_officer,
                    message=message
                )
                notified_count += 1
                self.stdout.write(
                    f"✓ Notified {deadline.case.assigned_officer.username} for deadline {deadline.id}"
                )
            else:
                # Fallback: notify head users for unassigned cases
                head_users = User.objects.filter(role='head')
                for head in head_users:
                    Notification.objects.create(
                        recipient=head,
                        message=f"UNASSIGNED CASE: {message} - Case has no assigned officer"
                    )
                notified_count += head_users.count()
                self.stdout.write(
                    self.style.WARNING(
                        f"✓ Notified {head_users.count()} head users for unassigned case deadline {deadline.id}"
                    )
                )

            # Escalate to head users if overdue by more than 2 days (always notify heads for escalation)
            if is_overdue:
                days_overdue = (today - due_date).days
                if days_overdue > 2:
                    head_users = User.objects.filter(role='head')
                    for head in head_users:
                        Notification.objects.create(
                            recipient=head,
                            message=f"ESCALATION: Deadline '{deadline.description}' for case {deadline.case.case_id} is {days_overdue} days overdue"
                    )
                    self.stdout.write(
                        f"✓ Escalated to {head_users.count()} head users (overdue by {days_overdue} days)"
                    )

            # Update last_notified_at
            deadline.last_notified_at = now
            deadline.save(update_fields=['last_notified_at'])

        self.stdout.write(f"Processed {len(deadlines)} deadlines, notified {notified_count}")

    def check_hearings(self, now):
        """Check for hearings within 48 hours"""
        # Find hearings within the next 48 hours
        time_window = now + timedelta(hours=48)
        hearings = Hearing.objects.filter(
            hearing_date__gte=now,
            hearing_date__lte=time_window
        ).select_related('case', 'case__assigned_officer')

        today = now.date()
        notified_count = 0

        for hearing in hearings:
            # Check if already notified today
            if hearing.last_notified_at and hearing.last_notified_at.date() == today:
                continue

            message = (
                f"Upcoming hearing for case {hearing.case.case_id} "
                f"on {hearing.hearing_date.strftime('%Y-%m-%d %H:%M')} "
                f"at {hearing.location}"
            )

            # Notify assigned officer if exists, otherwise notify head users
            if hearing.case.assigned_officer:
                Notification.objects.create(
                    recipient=hearing.case.assigned_officer,
                    message=message
                )
                notified_count += 1
                self.stdout.write(
                    f"✓ Notified {hearing.case.assigned_officer.username} for hearing {hearing.id}"
                )
            else:
                # Fallback: notify head users for unassigned cases
                head_users = User.objects.filter(role='head')
                for head in head_users:
                    Notification.objects.create(
                        recipient=head,
                        message=f"UNASSIGNED CASE: {message} - Case has no assigned officer"
                    )
                notified_count += head_users.count()
                self.stdout.write(
                    self.style.WARNING(
                        f"✓ Notified {head_users.count()} head users for unassigned case hearing {hearing.id}"
                    )
                )

            # Update last_notified_at
            hearing.last_notified_at = now
            hearing.save(update_fields=['last_notified_at'])

        self.stdout.write(f"Processed {len(hearings)} upcoming hearings, notified {notified_count}")
