package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.AuthIdentity;
import com.frandm.studytracker.backend.model.enums.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthIdentityRepository extends JpaRepository<AuthIdentity, Long> {
    Optional<AuthIdentity> findByProviderAndProviderUserId(AuthProvider provider,
                                                            String providerUserId);
}
