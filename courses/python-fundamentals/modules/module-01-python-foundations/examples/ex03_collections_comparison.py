"""Example M01-E03: Comparing list, tuple, dict, and set in one workflow."""
# Tuple for immutable coordinate metadata
station = ("BLR-01", 12.9716, 77.5946)

# List for ordered readings (duplicates allowed)
readings = [24.5, 25.0, 24.5, 26.1]

# Set for unique alert codes
alerts = {"TEMP_OK", "HUMID_OK"}
alerts.add("TEMP_OK")  # Ignored since already present

# Dict for fast key-value lookup
summary = {
    "station_id": station[0],
    "reading_count": len(readings),
    "unique_readings": sorted(set(readings)),
    "alerts": sorted(alerts),
}
print(summary)
