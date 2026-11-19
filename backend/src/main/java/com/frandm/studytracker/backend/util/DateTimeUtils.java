package com.frandm.studytracker.backend.util;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;

public final class DateTimeUtils {

    public static final DateTimeFormatter API_TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateTimeUtils() {}

    public static LocalDateTime parseApiTimestamp(String value) {
        return parseFlexibleTimestamp(value);
    }

    public static LocalDateTime parseIsoTimestamp(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String timestamp = value.trim();
        try {
            return LocalDateTime.parse(timestamp);
        } catch (DateTimeParseException ignored) {
            try {
                return OffsetDateTime.parse(timestamp)
                        .withOffsetSameInstant(ZoneOffset.UTC)
                        .toLocalDateTime();
            } catch (DateTimeParseException ignoredOffset) {
                return LocalDateTime.ofInstant(Instant.parse(timestamp), ZoneOffset.UTC);
            }
        }
    }

    public static LocalDateTime parseFlexibleTimestamp(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String timestamp = value.trim();
        if (timestamp.matches("\\d{4}-\\d{2}-\\d{2}")) {
            return LocalDate.parse(timestamp).atStartOfDay();
        }
        try {
            return LocalDateTime.parse(timestamp, API_TIMESTAMP_FORMAT);
        } catch (DateTimeParseException ignored) {
            return parseIsoTimestamp(timestamp);
        }
    }

    public static String formatApiTimestamp(LocalDateTime value) {
        return value.format(API_TIMESTAMP_FORMAT);
    }

    public static OffsetDateTime parseFlexibleOffset(String value) {
        LocalDateTime local = parseFlexibleTimestamp(value);
        return local == null ? null : local.atOffset(ZoneOffset.UTC);
    }

    public static String formatApiTimestamp(OffsetDateTime value) {
        return value == null ? null : formatApiTimestamp(value.toLocalDateTime());
    }

    public static String formatDueDate(OffsetDateTime dueAt, boolean allDay, ZoneId userZone) {
        if (dueAt == null) {
            return "";
        }
        ZoneId zone = userZone != null ? userZone : ZoneOffset.UTC;
        ZonedDateTime zdt = dueAt.atZoneSameInstant(zone);
        if (allDay) {
            return zdt.format(DateTimeFormatter.ISO_LOCAL_DATE);
        }
        return zdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd 'at' HH:mm"));
    }

    public static String formatRelativeDue(OffsetDateTime now, OffsetDateTime dueAt, boolean allDay, ZoneId userZone) {
        if (now == null || dueAt == null) {
            return "";
        }
        ZoneId zone = userZone != null ? userZone : ZoneOffset.UTC;
        ZonedDateTime nowZoned = now.atZoneSameInstant(zone);
        ZonedDateTime dueZoned = dueAt.atZoneSameInstant(zone);

        Duration duration = Duration.between(now, dueAt);
        if (duration.isNegative()) {
            return "Overdue";
        }

        if (allDay) {
            long daysBetween = ChronoUnit.DAYS.between(nowZoned.toLocalDate(), dueZoned.toLocalDate());
            if (daysBetween <= 0) {
                return "Due today";
            }
            if (daysBetween == 1) {
                return "Due in 1 day";
            }
            return "Due in " + daysBetween + " days";
        }

        long totalMinutes = duration.toMinutes();
        long totalHours = duration.toHours();

        if (totalHours >= 48) {
            long days = (totalHours + 12) / 24;
            return "Due in " + days + " days";
        }
        if (totalHours >= 24) {
            return "Due in 1 day";
        }
        if (totalHours >= 2) {
            return "Due in " + totalHours + " hours";
        }
        if (totalHours == 1) {
            return "Due in 1 hour";
        }
        long minutes = Math.max(1, totalMinutes);
        return minutes == 1 ? "Due in 1 minute" : "Due in " + minutes + " minutes";
    }
}
