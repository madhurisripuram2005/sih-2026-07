import math

def calculate_stopping_distance(speed_kmh: float, fog_level: float = 0.0, slope_grade: float = -2.0, mass_tonnes: float = 85.0) -> dict:
    """
    Physically consistent prototype model for stopping distance:
    Reaction Distance = v * reaction_time
    Braking Distance = v^2 / (2 * mu * g)
    Stopping Distance = Reaction Distance + Braking Distance

    v: vehicle speed in m/s
    reaction_time: 1.5 seconds (standard heavy haul dumper reaction time)
    g: 9.81 m/s^2
    mu: effective friction coefficient (adjusted for wet/slippery road in fog, slope, and mass)

    Note: This is a simplified prototype simulation model and does NOT represent real-world certified vehicle braking performance.
    """
    v_ms = max(0.0, speed_kmh / 3.6)
    t_reaction = 1.5  # seconds
    g = 9.81  # m/s^2

    # Base dry dirt friction for haul road
    base_mu = 0.65

    # Adjust friction for fog / moisture on unpaved haul road
    fog_factor = min(1.0, max(0.0, fog_level / 100.0))
    wet_reduction = fog_factor * 0.22  # up to 0.22 reduction in heavy fog
    
    # Adjust for downhill slope gradient (slope_grade in degrees, e.g. -2.0 means 2 deg downhill)
    slope_rad = math.radians(slope_grade)
    slope_effect = math.sin(slope_rad)  # negative for downhill
    
    # Adjust for vehicle mass (heavier loaded dumper takes longer to brake)
    mass_effect = (mass_tonnes - 30.0) * 0.001  # slight reduction for heavy dumpers

    effective_mu = max(0.20, base_mu - wet_reduction + slope_effect - mass_effect)

    reaction_distance = v_ms * t_reaction
    braking_distance = (v_ms ** 2) / (2.0 * effective_mu * g) if effective_mu > 0 else (v_ms ** 2) / 2.0
    total_stopping_distance = reaction_distance + braking_distance

    return {
        "reaction_distance_m": round(reaction_distance, 2),
        "braking_distance_m": round(braking_distance, 2),
        "total_stopping_distance_m": round(total_stopping_distance, 2),
        "effective_mu": round(effective_mu, 3),
        "speed_ms": round(v_ms, 2),
        "is_simulated_model": True
    }


def evaluate_collision_risk(speed_kmh: float, object_distance_m: float, relative_speed_kmh: float, fog_level: float) -> dict:
    """
    Evaluates collision risk tier, stopping distance, and recommended action.
    """
    stopping_info = calculate_stopping_distance(speed_kmh, fog_level)
    sd = stopping_info["total_stopping_distance_m"]

    # Calculate Time To Collision (TTC) if closing in
    closing_speed_ms = max(0.1, (speed_kmh - relative_speed_kmh) / 3.6)
    ttc = object_distance_m / closing_speed_ms if closing_speed_ms > 0 else 999.0

    if object_distance_m <= 0 or object_distance_m > 150.0:
        risk_level = "SAFE"
        recommended_action = "MAINTAIN SAFE SPEED & FOG LIGHTS ON"
        risk_score = 5.0
    elif object_distance_m <= sd * 0.85 or ttc <= 2.5:
        risk_level = "CRITICAL"
        recommended_action = "EMERGENCY BRAKE / SLOW DOWN IMMEDIATELY!"
        risk_score = 95.0
    elif object_distance_m <= sd * 1.25 or ttc <= 4.5:
        risk_level = "HIGH_RISK"
        recommended_action = "APPLY RETARDER & REDUCE SPEED TO 15 KM/H"
        risk_score = 75.0
    elif object_distance_m <= sd * 1.75 or ttc <= 7.0:
        risk_level = "CAUTION"
        recommended_action = "REDUCE SPEED TO 25 KM/H & INCREASE FOLLOWING DISTANCE"
        risk_score = 45.0
    else:
        risk_level = "SAFE"
        recommended_action = "MAINTAIN SAFE SPEED"
        risk_score = 15.0

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "object_distance_m": round(object_distance_m, 2),
        "stopping_distance_m": sd,
        "reaction_distance_m": stopping_info["reaction_distance_m"],
        "braking_distance_m": stopping_info["braking_distance_m"],
        "time_to_collision_sec": round(ttc, 1),
        "recommended_action": recommended_action,
        "disclaimer": "SIMULATED COLLISION RISK MODEL (PROTOTYPE ONLY)"
    }
