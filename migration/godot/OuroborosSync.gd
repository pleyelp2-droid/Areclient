extends Node

# --- OUROBOROS AUTO-SYNC MANAGER ---
# This script connects Godot to your Firebase Backend automatically.

var player_id = ""
var world_state = {}

func _ready():
	# 1. Initialize Firebase (Ensure GodotFirebase plugin is installed)
	Firebase.Auth.login_anonymous()
	Firebase.Auth.login_succeeded.connect(_on_login_success)
	
	# 2. Listen to Realtime World Pulse
	var rtdb_ref = Firebase.Database.get_ref("live_world")
	rtdb_ref.on_child_changed.connect(_on_world_tick)

func _on_login_success(auth):
	player_id = auth.localid
	print("Connected to Ouroboros Firebase as: ", player_id)
	
	# Load initial world state from Firestore
	var firestore_doc = Firebase.Firestore.collection("world_state").doc("current")
	firestore_doc.get_doc()
	firestore_doc.get_document_finished.connect(_on_state_loaded)

func _on_state_loaded(doc):
	world_state = doc.doc_fields
	print("World State Loaded. Tick: ", world_state.get("tick", 0))

func _on_world_tick(data):
	# This runs every minute when the Firebase Heartbeat triggers
	print("World Heartbeat received: ", data.data)
	# Trigger visual updates in your game here

func sync_position(pos: Vector3):
	# High-speed position sync
	var pos_ref = Firebase.Database.get_ref("live_positions/" + player_id)
	pos_ref.update({"x": pos.x, "y": pos.y, "z": pos.z})

func request_ai_quest():
	# Call the Firebase Cloud Function
	var function = Firebase.Functions.get_function("generateGameContent")
	function.execute({"type": "quest", "context": world_state})
	function.function_executed.connect(_on_quest_received)

func _on_quest_received(result):
	print("New AI Quest generated: ", result)
