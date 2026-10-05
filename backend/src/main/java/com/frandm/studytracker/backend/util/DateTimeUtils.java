package com.frandm.studytracker.backend.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

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
}
