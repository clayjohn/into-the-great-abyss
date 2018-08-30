extends Spatial

#should handle broad scene elements
#elements should include different sorts of features
	#some would always be present, others only sometimes
#including:
	# buildings
	# terrain
	# trees
	# rocks
	# shrubbery
	# water
## Add skirt for terrain
## Add fog to terrain
## Add static effect when near the edges


var terrain = load("res://src/scripts/sceneutils/Terrain.gd")
var objects = load("res://src/scripts/sceneutils/SceneObjects.gd").new()


func place_house(pos, mat):
	var matt = SpatialMaterial.new()
	var mesh = MeshInstance.new()
	mesh.set_mesh(objects.make_house(matt))
	mesh.translate(pos)
	add_child(mesh)

func add_location(mat):
	var location = load("res://src/scenes/ResourceDeposit.tscn").instance()
	location.material_override = mat
	location.translate(Vector3(randf()*200-100, 0.5, randf()*200-100))
	add_child(location)
	location.add_to_group("POIS")
	
func regenerate():
	var ground = terrain.new()
	add_child(ground)
	var depositMat = load("res://assets/shaders/ResourceDepositMaterial.tres")
	depositMat.set_shader_param("heightmap", planet.heightmap)
	depositMat.set_shader_param("world_pos", global.basePosition / global.size)
	depositMat.set_shader_param("scene_size", global.baseSize / global.size)
	for i in range(20):
		add_location(depositMat)
	
	
func _ready():
	set_process(true)
	
	pass
	#ground:417634
	#white:dddddd
	#ambient:a4d2cc
	#sky:98d6ec
	
func _process(delta):
	if Input.is_action_pressed("scene_forward"):
		$Camera.translate(Vector3(0,0,-0.1))
	if Input.is_action_pressed("scene_left"):
		$Camera.rotate_y(0.01)
	if Input.is_action_pressed("scene_back"):
		$Camera.translate(Vector3(0,0,0.1))
	if Input.is_action_pressed("scene_right"):
		$Camera.rotate_y(-0.01)
	##check distance to POIS
	for node in get_tree().get_nodes_in_group("POIS"):
		var cam = $Camera.translation
		var d = node.translation.distance_squared_to(Vector3(cam.x, 0.5, cam.z))
		if d>100:
			node.hide()
		else:
			node.show()
		var s = 1.0 - (d / 100.0)
		s = 1-pow(1-s, 4)
		node.scale = Vector3(s, s, s)
	