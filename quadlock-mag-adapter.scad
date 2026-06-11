// ============================================
// Quadlock MAG → Magnetni nosač adapter
// ============================================
// Adapter koji se zakači na Quadlock MAG masku telefona
// sa jedne strane, a sa druge ima udubljenje za neodijumski
// magnet za magnetni auto nosač.
//
// UPUTSTVO: Podesi parametre ispod prema svojim merama.
// Nakon prvog test printa, fino podesi tolerancije.
// ============================================

// --- PARAMETRI (podesi prema potrebi) ---

// Magnet
magnet_diameter   = 20;    // prečnik magneta (mm)
magnet_height     = 3;     // debljina magneta (mm)
magnet_tolerance  = 0.2;   // tolerancija za lakše umetanje (mm)

// Adapter telo
adapter_diameter  = 45;    // spoljni prečnik adaptera (mm)
wall_thickness    = 1.5;   // minimalna debljina zida između slotova i magneta (mm)
corner_radius     = 2;     // zaobljenje ivica (mm)

// Quadlock female interfejs (gornja strana)
// Ove mere podesi prema svojoj maski - izmeri šublerom!
ql_center_diameter = 30;   // prečnik centralnog kruga (mm)
ql_center_depth    = 1.2;  // dubina centralnog udubljenja (mm)
ql_slot_width      = 7;    // širina locking slota (mm)
ql_slot_length     = 14;   // dužina slota od centra ka spolja (mm)
ql_slot_depth      = 2.5;  // dubina locking slota (mm)
ql_twist_angle     = 20;   // ugao rotacije za zaključavanje (stepeni)
ql_tab_width       = 7;    // širina zupca/taba (mm)
ql_tab_arc         = 40;   // luk koji tab pokriva (stepeni)

// --- IZRAČUNATE VREDNOSTI ---
total_height = ql_slot_depth + wall_thickness + magnet_height;
magnet_r     = (magnet_diameter + magnet_tolerance) / 2;
adapter_r    = adapter_diameter / 2;
ql_center_r  = ql_center_diameter / 2;

$fn = 100; // rezolucija krivina

// ============================================
// GLAVNI MODEL
// ============================================

module adapter() {
    difference() {
        // Bazni disk - telo adaptera
        base_body();

        // Gornja strana: Quadlock female slotovi
        translate([0, 0, total_height])
            quadlock_female();

        // Donja strana: udubljenje za magnet
        magnet_pocket();
    }
}

// --- Bazni disk sa zaobljenim ivicama ---
module base_body() {
    // Koristi minkowski za zaobljene ivice
    minkowski() {
        cylinder(
            h = total_height - corner_radius * 2,
            r = adapter_r - corner_radius,
            center = false
        );
        sphere(r = corner_radius);
    }
}

// --- Quadlock female interfejs ---
// Ovo je udubljenje na gornjoj strani koje prima
// twist-lock zupce sa Quadlock MAG maske
module quadlock_female() {
    // Centralno kružno udubljenje
    translate([0, 0, -ql_center_depth])
        cylinder(h = ql_center_depth + 1, r = ql_center_r);

    // Dva locking slota na 0° i 180°
    // Svaki slot ima ulazni deo i zakretni deo
    for (angle = [0, 180]) {
        rotate([0, 0, angle]) {
            // Ulazni slot (pravolinijski)
            quadlock_slot_entry();

            // Zakretni deo (luk gde se tab zaključava)
            quadlock_slot_lock();
        }
    }
}

// Ulazni deo slota - tab ulazi pravo
module quadlock_slot_entry() {
    translate([0, -ql_slot_width/2, -ql_slot_depth])
        cube([ql_slot_length, ql_slot_width, ql_slot_depth + 1]);
}

// Zakretni deo - tab se rotira i zaključava
module quadlock_slot_lock() {
    translate([0, 0, -ql_slot_depth])
        rotate_extrude(angle = ql_twist_angle)
            translate([ql_center_r - 2, 0, 0])
                square([ql_slot_length - ql_center_r + 4, ql_slot_depth + 1]);
}

// --- Udubljenje za magnet (donja strana) ---
module magnet_pocket() {
    translate([0, 0, -corner_radius + 0.01])
        cylinder(h = magnet_height, r = magnet_r);
}

// --- RENDEROVANJE ---
adapter();

// ============================================
// NAPOMENE ZA ŠTAMPU:
// - Layer height: 0.2mm
// - Infill: 100% (pun materijal za čvrstoću)
// - Materijal: PETG ili ABS (PLA može ali je krtiji)
// - Supports: NE trebaju ako se štampa magnet stranom dole
// - Orijentacija: magnet strana dole na build plate
//
// NAKON ŠTAMPE:
// 1. Proveri da li Quadlock tab ulazi u slotove
// 2. Ako je pretesno - povećaj tolerancije/širine
// 3. Ako je prelabavo - smanji širine slotova
// 4. Zalepi magnet super lepkom u udubljenje
// ============================================
