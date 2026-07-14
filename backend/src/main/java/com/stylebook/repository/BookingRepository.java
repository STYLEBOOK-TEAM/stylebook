package com.stylebook.repository;

import com.stylebook.entity.Booking;
import com.stylebook.entity.Shop;
import com.stylebook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByCustomerOrderByBookingDateDescBookingTimeDesc(User customer);

    List<Booking> findByShopOrderByBookingDateAscBookingTimeAsc(Shop shop);

    @Query("SELECT b FROM Booking b WHERE b.shop = :shop AND " +
           "b.bookingDate = :date AND b.bookingTime = :time AND " +
           "b.status IN ('PENDING', 'CONFIRMED')")
    List<Booking> findConflictingBookings(@Param("shop") Shop shop,
                                          @Param("date") LocalDate date,
                                          @Param("time") LocalTime time);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND " +
           "b.autoConfirmAt <= :now")
    List<Booking> findBookingsToAutoConfirm(@Param("now") LocalDateTime now);

    @Query("SELECT b FROM Booking b WHERE b.shop = :shop AND " +
           "b.bookingDate = :date AND b.status IN ('PENDING', 'CONFIRMED')")
    List<Booking> findActiveByShopAndDate(@Param("shop") Shop shop,
                                          @Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND " +
           "b.bookingDate <= :today")
    List<Booking> findConfirmedUpToDate(@Param("today") LocalDate today);

    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND " +
           "b.status IN ('PENDING', 'CONFIRMED') AND " +
           "b.bookingDate >= :today " +
           "ORDER BY b.bookingDate ASC, b.bookingTime ASC")
    List<Booking> findUpcomingByCustomer(@Param("customer") User customer,
                                          @Param("today") LocalDate today);

    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND " +
           "b.status IN ('COMPLETED', 'CANCELLED') " +
           "ORDER BY b.bookingDate DESC, b.bookingTime DESC")
    List<Booking> findPastByCustomer(@Param("customer") User customer);

    @Query("SELECT b FROM Booking b WHERE b.shop = :shop AND " +
           "b.status IN ('PENDING', 'CONFIRMED') AND " +
           "b.bookingDate >= :today " +
           "ORDER BY b.bookingDate ASC, b.bookingTime ASC")
    List<Booking> findUpcomingByShop(@Param("shop") Shop shop,
                                      @Param("today") LocalDate today);
}