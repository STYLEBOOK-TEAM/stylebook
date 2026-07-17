package com.stylebook.config;

import com.stylebook.entity.*;
import com.stylebook.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Seeds realistic demo shops across Ghanaian cities the first time the app starts.
 * Runs only once — skipped when the marker account already exists.
 * All demo owners log in with password: demo123
 */
@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ServiceRepository serviceRepository;
    private final ShopPhotoRepository shopPhotoRepository;
    private final PostRepository postRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String HOURS_STANDARD =
        "{\"MON\":\"09:00-19:00\",\"TUE\":\"09:00-19:00\",\"WED\":\"09:00-19:00\",\"THU\":\"09:00-19:00\",\"FRI\":\"09:00-19:00\",\"SAT\":\"08:00-20:00\"}";
    private static final String HOURS_BARBER =
        "{\"MON\":\"08:00-20:00\",\"TUE\":\"08:00-20:00\",\"WED\":\"08:00-20:00\",\"THU\":\"08:00-20:00\",\"FRI\":\"08:00-21:00\",\"SAT\":\"07:00-21:00\",\"SUN\":\"10:00-18:00\"}";
    private static final String HOURS_SPA =
        "{\"TUE\":\"10:00-18:00\",\"WED\":\"10:00-18:00\",\"THU\":\"10:00-18:00\",\"FRI\":\"10:00-19:00\",\"SAT\":\"09:00-19:00\",\"SUN\":\"11:00-17:00\"}";

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("kofi@demoshops.com")) {
            System.out.println("[DemoData] Demo shops already present — skipping seeding.");
            return;
        }
        System.out.println("[DemoData] Seeding demo shops...");

        User ama = customer("Ama Mensah", "ama@demoshops.com", "0244000001");
        User kwame = customer("Kwame Boateng", "kwame@demoshops.com", "0244000002");

        seedShop("Kofi", "kofi@demoshops.com", "Kofi's Royal Cuts", Shop.ShopCategory.BARBERSHOP,
            "Accra", 5.6037, -0.1870, "Osu, behind the Night Market", HOURS_BARBER,
            new String[][]{{"Low Fade", "40", "30"}, {"Sakora (Clean Shave)", "30", "25"},
                {"Beard Sculpting", "25", "20"}, {"Hair Dye & Cut", "90", "60"}},
            "royal1", "Fresh fades all week 💈", "Walk-ins welcome every Saturday",
            ama, kwame, 5, 4, "Best fade in Osu, hands down.", "Clean shop, zero waiting with the queue feature.");

        seedShop("Adjoa", "adjoa@demoshops.com", "Adjoa Glam Studio", Shop.ShopCategory.SALON,
            "Accra", 5.6150, -0.1740, "East Legon, American House junction", HOURS_STANDARD,
            new String[][]{{"Knotless Braids", "350", "180"}, {"Silk Press", "150", "90"},
                {"Wig Installation", "200", "120"}, {"Wash & Treatment", "80", "45"}},
            "glam2", "Knotless season is here ✨", "Book your silk press for the weekend",
            ama, kwame, 5, 5, "My braids lasted 6 weeks. Perfection.", "Adjoa treats your hair like her own.");

        seedShop("Efua", "efua@demoshops.com", "Serenity Spa & Wellness", Shop.ShopCategory.SPA,
            "Accra", 5.5913, -0.2087, "Airport Residential, near Marina Mall", HOURS_SPA,
            new String[][]{{"Full Body Massage", "250", "90"}, {"Facial Treatment", "180", "60"},
                {"Hot Stone Therapy", "300", "120"}, {"Foot Reflexology", "120", "45"}},
            "serenity3", "Unwind this weekend 🌿", "Couples massage packages now available",
            ama, kwame, 5, 4, "Left feeling like a new person.", "Very calm atmosphere, professional staff.");

        seedShop("Yaw", "yaw@demoshops.com", "Ash-Town Fades", Shop.ShopCategory.BARBERSHOP,
            "Kumasi", 6.6884, -1.6244, "Ashanti New Town, main road", HOURS_BARBER,
            new String[][]{{"Taper Fade", "35", "30"}, {"Kids' Cut", "20", "20"},
                {"Waves Treatment", "50", "40"}, {"Full Grooming Package", "100", "75"}},
            "ashtown4", "Kumasi's sharpest lines 💯", "Bring your son for Saturday kids' special",
            ama, kwame, 4, 5, "Sharpest lineup in Kumasi.", "My go-to shop every two weeks.");

        seedShop("Akosua", "akosua@demoshops.com", "Golden Touch Beauty", Shop.ShopCategory.SALON,
            "Kumasi", 6.7000, -1.6163, "Adum, opposite Prempeh Assembly Hall", HOURS_STANDARD,
            new String[][]{{"Ghana Weaving", "120", "120"}, {"Crochet Braids", "180", "150"},
                {"Relaxer & Style", "100", "90"}, {"Bridal Styling", "500", "240"}},
            "golden5", "Bridal bookings open for December ❤️", "Ghana weaving special this month",
            ama, kwame, 5, 4, "Did my wedding hair — flawless.", "Fair prices and beautiful work.");

        seedShop("Esi", "esi@demoshops.com", "Harbour City Nails", Shop.ShopCategory.NAILS,
            "Tema", 5.6698, -0.0166, "Community 1, near the roundabout", HOURS_STANDARD,
            new String[][]{{"Gel Manicure", "80", "45"}, {"Acrylic Full Set", "150", "90"},
                {"Pedicure Deluxe", "100", "60"}, {"Nail Art (per design)", "30", "30"}},
            "nails6", "New chrome collection just dropped 💅", "Pedicure Tuesdays — 20% off",
            ama, kwame, 4, 4, "My acrylics always last a month.", "Cute designs, gentle hands.");

        seedShop("Kojo", "kojo@demoshops.com", "Meridian Barbers", Shop.ShopCategory.BARBERSHOP,
            "Tema", 5.6790, -0.0080, "Community 25, Meridian Mall area", HOURS_BARBER,
            new String[][]{{"Executive Cut", "60", "40"}, {"Buzz Cut", "25", "15"},
                {"Beard Trim & Line", "30", "20"}, {"Hot Towel Shave", "45", "30"}},
            "meridian7", "The executive treatment 🤵", "Hot towel shaves are back",
            ama, kwame, 5, 4, "Feels like a VIP lounge.", "Quick, clean, professional.");

        seedShop("Abena", "abena@demoshops.com", "Coastal Beauty Lounge", Shop.ShopCategory.SALON,
            "Takoradi", 4.9016, -1.7831, "Market Circle, second floor", HOURS_STANDARD,
            new String[][]{{"Box Braids", "250", "180"}, {"Cornrows", "80", "60"},
                {"Hair Coloring", "200", "120"}, {"Deep Conditioning", "60", "40"}},
            "coastal8", "Takoradi, we are open! 🌊", "Cornrow specials every Wednesday",
            ama, kwame, 4, 5, "Finally a proper salon in Tadi.", "The color came out exactly as the photo.");

        seedShop("Kwabena", "kwabena@demoshops.com", "Castle View Spa", Shop.ShopCategory.SPA,
            "Cape Coast", 5.1053, -1.2466, "Victoria Road, near the castle", HOURS_SPA,
            new String[][]{{"Swedish Massage", "220", "90"}, {"Aromatherapy Session", "180", "60"},
                {"Body Scrub & Glow", "150", "75"}, {"Head & Shoulder Massage", "90", "30"}},
            "castle9", "Ocean views, deep relaxation 🌅", "Student discounts with valid ID",
            ama, kwame, 5, 5, "Massage with a sea breeze — unreal.", "Worth the trip from Accra.");

        seedShop("Fuseini", "fuseini@demoshops.com", "Northern Kings Barbershop", Shop.ShopCategory.BARBERSHOP,
            "Tamale", 9.4008, -0.8393, "Aboabo Market road", HOURS_BARBER,
            new String[][]{{"King's Fade", "30", "30"}, {"Afro Shape-Up", "25", "25"},
                {"Beard Grooming", "20", "20"}, {"Royal Package", "80", "60"}},
            "kings10", "Kings stay sharp 👑", "Friday rush? Join the queue from home",
            ama, kwame, 4, 4, "Tamale's finest, no argument.", "The royal package is worth every cedi.");

        System.out.println("[DemoData] Done — 10 shops, 2 customers seeded. Owner password: demo123");
    }

    private static final java.util.Map<Shop.ShopCategory, String[]> CATEGORY_KEYWORDS =
        java.util.Map.of(
            Shop.ShopCategory.BARBERSHOP,
                new String[]{"barbershop", "barber", "haircut", "barbershop", "barber", "haircut"},
            Shop.ShopCategory.SALON,
                new String[]{"hairsalon", "hairstyle", "hairdresser", "braids", "hairsalon", "hairstyle"},
            Shop.ShopCategory.SPA,
                new String[]{"spa", "massage", "wellness", "spa", "massage", "wellness"},
            Shop.ShopCategory.NAILS,
                new String[]{"manicure", "nails", "nailpolish", "pedicure", "manicure", "nails"});

    private String themedImage(Shop.ShopCategory category, String seed, int index, int w, int h) {
        String[] keywords = CATEGORY_KEYWORDS.get(category);
        String keyword = keywords[index % keywords.length];
        int lock = Math.abs((seed + index).hashCode()) % 999;
        return "https://loremflickr.com/" + w + "/" + h + "/" + keyword + "?lock=" + lock;
    }

    private User customer(String name, String email, String phone) {
        User u = User.builder()
            .fullName(name).email(email).phone(phone)
            .password(passwordEncoder.encode("demo123"))
            .role(User.UserRole.CUSTOMER)
            .emailVerified(true)
            .build();
        return userRepository.save(u);
    }

    private void seedShop(String ownerFirst, String email, String shopName, Shop.ShopCategory category,
                          String city, double lat, double lng, String locationDesc, String hours,
                          String[][] services, String imgSeed, String caption1, String caption2,
                          User cust1, User cust2, int rating1, int rating2,
                          String reviewText1, String reviewText2) {
        User owner = User.builder()
            .fullName(ownerFirst + " (Demo Owner)").email(email).phone("0200000000")
            .password(passwordEncoder.encode("demo123"))
            .role(User.UserRole.OWNER)
            .emailVerified(true)
            .build();
        userRepository.save(owner);

        Shop shop = Shop.builder()
            .owner(owner).name(shopName).category(category).city(city)
            .description("One of " + city + "'s favourite spots for " + category.name().toLowerCase()
                + " services. Friendly staff, fair prices, walk-ins welcome.")
            .latitude(lat).longitude(lng)
            .locationDescription(locationDesc)
            .openingHours(hours)
            .coverImageUrl(themedImage(category, imgSeed, 0, 800, 500))
            .plan(Shop.SubscriptionPlan.FREE)
            .isActive(true).avgRating(0.0).reviewCount(0)
            .build();
        shopRepository.save(shop);

        com.stylebook.entity.Service firstService = null;
        for (String[] sv : services) {
            com.stylebook.entity.Service service = com.stylebook.entity.Service.builder()
                .shop(shop).name(sv[0])
                .price(new BigDecimal(sv[1]))
                .durationMinutes(Integer.parseInt(sv[2]))
                .isActive(true)
                .build();
            serviceRepository.save(service);
            if (firstService == null) firstService = service;
        }

        for (int i = 1; i <= 3; i++) {
            shopPhotoRepository.save(ShopPhoto.builder()
                .shop(shop)
                .imageUrl(themedImage(category, imgSeed, i, 600, 600))
                .build());
        }

        postRepository.save(Post.builder().shop(shop)
            .imageUrl(themedImage(category, imgSeed, 4, 700, 700))
            .caption(caption1).likeCount(0).build());
        postRepository.save(Post.builder().shop(shop)
            .imageUrl(themedImage(category, imgSeed, 5, 700, 700))
            .caption(caption2).likeCount(0).build());

        Booking b1 = bookingRepository.save(Booking.builder()
            .customer(cust1).shop(shop).service(firstService)
            .bookingDate(LocalDate.now().minusDays(6)).bookingTime(LocalTime.of(10, 0))
            .status(Booking.BookingStatus.COMPLETED).rescheduled(false)
            .build());
        Booking b2 = bookingRepository.save(Booking.builder()
            .customer(cust2).shop(shop).service(firstService)
            .bookingDate(LocalDate.now().minusDays(3)).bookingTime(LocalTime.of(14, 0))
            .status(Booking.BookingStatus.COMPLETED).rescheduled(false)
            .build());

        reviewRepository.save(Review.builder()
            .customer(cust1).shop(shop).booking(b1).rating(rating1).comment(reviewText1).build());
        reviewRepository.save(Review.builder()
            .customer(cust2).shop(shop).booking(b2).rating(rating2).comment(reviewText2).build());

        shop.setAvgRating(Math.round(((rating1 + rating2) / 2.0) * 10.0) / 10.0);
        shop.setReviewCount(2);
        shopRepository.save(shop);
    }
}
