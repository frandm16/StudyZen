package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.VerificationToken;
import com.frandm.studytracker.backend.model.enums.TokenPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;

import java.util.Optional;
import java.util.UUID;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByTokenHashAndPurposeAndUsedAtIsNull(String tokenHash, TokenPurpose purpose);
    void deleteByUserIdAndPurposeAndUsedAtIsNull(UUID userId, TokenPurpose purpose);

    @Modifying
    @Query("UPDATE VerificationToken t SET t.usedAt = :now WHERE t.tokenHash = :tokenHash AND t.purpose = :purpose AND t.usedAt IS NULL AND t.expiresAt > :now")
    int claimValidToken(@Param("tokenHash") String tokenHash, @Param("purpose") TokenPurpose purpose, @Param("now") OffsetDateTime now);
}
