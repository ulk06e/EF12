import math

def calculate_xp(actual_duration, estimated_duration, task_quality, time_quality, priority):
    """
    XP Calculation Rules:
    - 1 XP per 10 minutes of actual duration.
    - Task Quality multiplier:
        A = 4
        B = 3
        C = 2
        D = 1
    - Time Quality:
        pure = 1.5
        not-pure = 1.0
    - Priority:
        1 = 1.5
        2 = 1.4
        3 = 1.3
        else = 1.0
    - Duration Accuracy:
        If actual is within ±20% of estimated: 1.0
        Else: 0.7
    """

    base_xp = actual_duration / 10

    quality_map = {"A": 4, "B": 3, "C": 2, "D": 1}
    quality_multiplier = quality_map.get(task_quality, 1)

    time_quality_multiplier = 1.5 if time_quality == "pure" else 1.0

    if priority == 1:
        priority_multiplier = 1.5
    elif priority == 2:
        priority_multiplier = 1.4
    elif priority == 3:
        priority_multiplier = 1.3
    else:
        priority_multiplier = 1.0

    if estimated_duration == 0:
        duration_multiplier = 0.7
    else:
        diff_ratio = abs(actual_duration - estimated_duration) / estimated_duration
        duration_multiplier = 1.0 if diff_ratio <= 0.2 else 0.7

    xp = base_xp * quality_multiplier * time_quality_multiplier * priority_multiplier * duration_multiplier + 40
    return math.floor(xp)
