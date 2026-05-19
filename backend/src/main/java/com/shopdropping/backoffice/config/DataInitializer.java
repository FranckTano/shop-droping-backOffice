package com.shopdropping.backoffice.config;

import com.shopdropping.backoffice.entity.Categorie;
import com.shopdropping.backoffice.entity.User;
import com.shopdropping.backoffice.repository.CategorieRepository;
import com.shopdropping.backoffice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategorieRepository categorieRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initialiserSuperAdmin();
        initialiserCategories();
    }

    private void initialiserSuperAdmin() {
        boolean superAdminExiste = userRepository.existsByRole("SUPER_ADMIN");
        if (!superAdminExiste) {
            User superAdmin = User.builder()
                    .username("superadmin")
                    .password(passwordEncoder.encode("Admin@2026!"))
                    .nom("Administrateur")
                    .prenoms("Super")
                    .role("SUPER_ADMIN")
                    .statut("ACTIF")
                    .build();
            userRepository.save(superAdmin);
            log.info("SUPER_ADMIN créé: superadmin / Admin@2026!");
        }
    }

    private void initialiserCategories() {
        if (categorieRepository.count() == 0) {
            List<Categorie> categories = List.of(
                    Categorie.builder().nom("actuel").description("Maillots de la saison actuelle").actif(true).build(),
                    Categorie.builder().nom("vintage-court").description("Maillots vintage à manches courtes").actif(true).build(),
                    Categorie.builder().nom("vintage-long").description("Maillots vintage à manches longues").actif(true).build(),
                    Categorie.builder().nom("collection").description("Maillots de collection").actif(true).build()
            );
            categorieRepository.saveAll(categories);
            log.info("Catégories initialisées: actuel, vintage-court, vintage-long, collection");
        }
    }
}
