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
        initialiserAdmins();
        initialiserCategories();
    }

    private void initialiserSuperAdmin() {
        if (!userRepository.existsByUsername("franck")) {
            // Supprimer l'ancien compte superadmin par défaut si présent
            if (userRepository.existsByUsername("superadmin")) {
                userRepository.deleteByUsername("superadmin");
            }
            User superAdmin = User.builder()
                    .username("franck")
                    .password(passwordEncoder.encode("Admin@2026!"))
                    .nom("TANO")
                    .prenoms("Franck")
                    .role("SUPER_ADMIN")
                    .statut("ACTIF")
                    .telephone("+255 0799136306")
                    .recevoirCommandes(false)
                    .build();
            userRepository.save(superAdmin);
            log.info("SUPER_ADMIN créé: franck / Admin@2026!");
        }
    }

    private void initialiserAdmins() {
        if (!userRepository.existsByUsername("momo")) {
            User momo = User.builder()
                    .username("momo")
                    .password(passwordEncoder.encode("Admin@2026!"))
                    .nom("DICKO")
                    .prenoms("Hamed")
                    .role("ADMIN")
                    .statut("ACTIF")
                    .telephone("+255 0749516657")
                    .recevoirCommandes(false)
                    .build();
            userRepository.save(momo);
            log.info("ADMIN créé: momo / Admin@2026!");
        }
        if (!userRepository.existsByUsername("moussa")) {
            User moussa = User.builder()
                    .username("moussa")
                    .password(passwordEncoder.encode("Admin@2026!"))
                    .nom("DICKO")
                    .prenoms("Moussa")
                    .role("ADMIN")
                    .statut("ACTIF")
                    .telephone("+255 0789261994")
                    .recevoirCommandes(false)
                    .build();
            userRepository.save(moussa);
            log.info("ADMIN créé: moussa / Admin@2026!");
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
