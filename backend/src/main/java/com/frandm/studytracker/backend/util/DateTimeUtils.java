package com.frandm.studytracker.backend.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class DateTimeUtils {

    public static final DateTimeFormatter API_TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateTimeUtils() {}

    public static LocalDateTime parseApiTimestamp(String value) {
        return LocalDateTime.parse(value, API_TIMESTAMP_FORMAT);
    }

    public static LocalDateTime parseIsoTimestamp(String value) {
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
            try {
                return OffsetDateTime.parse(value).toLocalDateTime();
            } catch (DateTimeParseException ignoredOffset) {
                return LocalDateTime.ofInstant(Instant.parse(value), ZoneId.systemDefault());
            }
        }
    }

    public static LocalDateTime parseFlexibleTimestamp(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.contains("T") ? parseIsoTimestamp(value) : parseApiTimestamp(value);
    }

    public static String formatApiTimestamp(LocalDateTime value) {
        return value.format(API_TIMESTAMP_FORMAT);
    }
}
