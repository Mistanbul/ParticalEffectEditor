import Input from './input'
import Gradient from './gradient'
import {Emitter, updateMaterial, System} from './emitter'
import vscode from './vscode_extension';

const Data = {
	effect: {
		label: '粒子特效',
		meta: {
			label: '元数据',
			_folded: false,
			inputs: {
				identifier: new Input({
					id: 'identifier',
					label: 'ID',
					info: '粒子特效的命名空间与名称',
					placeholder: '命名空间:名称',
					required: true,
					type: 'text',
					onchange() {
						document.title = (this.value ? this.value + ' - ' : '') + 'GermEditor';
					}
				})
			}
		},
		space: {
			label: '局部空间',
			_folded: true,
			inputs: {
				local_position: new Input({
					id: 'space_local_position',
					label: '局部位置',
					info: '启用后，粒子特效将保持附加在粒子发射器所在的局部空间内并直接跟随它们的位置',
					type: 'checkbox'
				}),
				local_rotation: new Input({
					id: 'space_local_rotation',
					label: '局部旋转',
					info: '启用后，粒子特效将保持附加在粒子发射器所在的局部空间内并直接跟随它们的旋转（仅在启用局部位置选项后生效）',
					type: 'checkbox'
				}),
				local_velocity: new Input({
					id: 'space_local_velocity',
					label: '局部速度',
					info: '启用后，粒子特效将保持附加在粒子发射器所在的局部空间内并直接跟随它们的速度',
					type: 'checkbox'
				})
			}
		},
		variables: {
			label: 'MoLang变量',
			_folded: true,
			inputs: {
				creation_vars: new Input({
					id: 'variables_creation_vars',
					label: '启动变量',
					info: '设置粒子发射器启动时的MoLang变量',
					placeholder: 'variable.名称 = 值',
					type: 'molang',
					axis_count: -1,
					onchange: function() {
						Emitter.creation_variables = {};
						this.value.forEach((s, i) => {
							var p = s.toLowerCase().replace(/\s/g, '').split('=')
							if (p.length > 1) {
								let key = p.shift();
								Emitter.creation_variables[key] = p.join('=');
							}
						})
					}
				}),
				tick_vars: new Input({
					id: 'variables_tick_vars',
					label: '游戏刻变量',
					info: '每次粒子发射器更新时处理MoLang变量',
					placeholder: 'variable.名称 = 值',
					type: 'molang',
					axis_count: -1,
					onchange: function() {
						Emitter.tick_variables = {};
						this.value.forEach((s, i) => {
							var p = s.toLowerCase().replace(/\s/g, '').split('=')
							if (p.length > 1) {
								let key = p.shift();
								Emitter.tick_variables[key] = p.join('=');
							}
						})
					}
				})
			}
		},
		curves: {
			label: '粒子曲线',
			_folded: true,
			type: 'curves',
			curves: []
		}
	},
	emitter: {
		label: '粒子发射器',
		rate: {
			label: '频率',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'emitter_rate_mode',
					type: 'select',
					label: '模式',
					info: '',
					mode_groups: ['emitter', 'rate'],
					options: {
						steady: '固定模式',
						instant: '瞬时模式'
					}
				}),
				rate: new Input({
					id: 'emitter_rate_rate',
					label: '发射频率',
					info: '设置发射器每秒发射的粒子数',
					enabled_modes: ['steady'],
					required: true,
					value: 1,
				}),
				amount: new Input({
					id: 'emitter_rate_amount',
					label: '发射数量',
					info: '设置发射器一次性发射的粒子数',
					enabled_modes: ['instant'],
					required: true,
				}),
				maximum: new Input({
					id: 'emitter_rate_maximum',
					label: '最大发射值',
					info: '设置发射器每次发射的最大粒子数',
					enabled_modes: ['steady'],
					required: true,
					value: 100,
				})
			}
		},
		lifetime: {
			label: '生命周期',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'emitter_lifetime_mode',
					type: 'select',
					label: '模式',
					info: '',
					mode_groups: ['emitter', 'lifetime'],
					options: {
						looping: '周期循环',
						once: '单次周期',
						expression: '表达式'
					},
					//updatePreview: (m) => {Emitter.mode = m}
				}),
				active_time: new Input({
					id: 'emitter_lifetime_active_time',
					label: '发射时间',
					info: '设置发射器每个周期的发射时间',
					enabled_modes: ['looping', 'once'],
					required: true,
					value: 1,
					//updatePreview: (v) => {Emitter.active_time = v}
				}),
				sleep_time: new Input({
					id: 'emitter_lifetime_sleep_time',
					label: '休眠时间',
					info: '设置发射器每个周期结束后的暂停时间',
					enabled_modes: ['looping'],
					//updatePreview: (v) => {Emitter.sleep_time = v}
				}),
				activation: new Input({
					id: 'emitter_lifetime_activation',
					label: '发射表达式',
					info: '当表达式结果不为零时进行粒子发射',
					required: true,
					enabled_modes: ['expression']
				}),
				expiration: new Input({
					id: 'emitter_lifetime_expiration',
					label: '结束表达式',
					info: '当表达式结果不为零时结束粒子发射',
					enabled_modes: ['expression']
				})
			}
		},
		shape: {
			label: '形状',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'emitter_shape_mode',
					type: 'select',
					label: '模式',
					mode_groups: ['emitter', 'shape'],
					options: {
						point: '点状',
						sphere: '球体',
						box: '正方体',
						disc: '圆盘',
						//custom: 'Custom',
						entity_aabb: '实体碰撞箱',
					},
					//updatePreview: (m) => {Emitter.shape = m}
				}),
				offset: new Input({
					id: 'emitter_shape_offset',
					label: '偏移',
					info: '设置每个发射的粒子与发射器的距离',
					axis_count: 3,
					enabled_modes: ['point', 'sphere', 'box', 'custom', 'disc']
				}),
				radius: new Input({
					id: 'emitter_shape_radius',
					label: '半径',
					required: true,
					info: '设置半径',
					enabled_modes: ['sphere', 'disc'],
				}),
				half_dimensions: new Input({
					id: 'emitter_shape_half_dimensions',
					label: '正方体大小',
					info: '设置正方体的边长的一半的值',
					axis_count: 3,
					enabled_modes: ['box'],
				}),
				plane_normal: new Input({
					id: 'emitter_shape_plane_normal',
					label: '法线',
					info: '设置圆盘平面的法线，圆盘将垂直于该方向',
					axis_count: 3,
					enabled_modes: ['disc']
				}),
				surface_only: new Input({
					id: 'emitter_shape_surface_only',
					label: '仅表面',
					info: '仅在表面发射粒子',
					type: 'checkbox',
					enabled_modes: ['sphere', 'box', 'entity_aabb', 'disc']
				})
			}
		},
	},
	particle: {
		label: '粒子',
		appearance: {
			label: '外观',
			_folded: false,
			inputs: {
				size: new Input({
					id: 'particle_appearance_size',
					label: '大小',
					info: '设置粒子板的x/y值',
					axis_count: 2,
					value: [0.2, 0.2]
				}),
				facing_camera_mode: new Input({
					id: 'particle_appearance_facing_camera_mode',
					type: 'select',
					info: '选择粒子板面向玩家相机的模式',
					label: '朝向',
					options: {
						rotate_xyz: '与相机对齐，垂直于视图轴',
						rotate_y: '与相机对齐，绕世界Y轴旋转',
						lookat_xyz: '瞄准相机，偏向世界Y轴',
						lookat_y: '瞄准相机，绕世界Y轴旋转',
						direction_x: '未旋转的粒子X轴沿方向矢量，未旋转的Y轴尝试向上瞄准',
						direction_y: '未旋转的粒子Y轴沿方向矢量，未旋转的X轴尝试向上瞄准',
						direction_z: '粒子板面沿方向矢量，未旋转的Y轴尝试向上瞄准',
					},
				}),
				material: new Input({
					id: 'particle_appearance_material',
					type: 'select',
					info: '选择粒子的材质',
					label: '材质',
					options: {
						particles_alpha: 'Alpha',
						particles_blend: 'Blend',
						particles_opaque: 'Opaque',
					},
				}),
			}
		},
		direction: {
			label: '方向',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_direction_mode',
					type: 'select',
					info: '设置发射粒子相对于发射器形状的方向',
					label: '模式',
					mode_groups: ['particle', 'direction'],
					options: {
						outwards: '方向向外',
						inwards: '方向向内',
						direction: '自定义方向',
					},
				}),
				direction: new Input({
					id: 'particle_direction_direction',
					label: '方向',
					info: '发射粒子的方向，x/y/z',
					axis_count: 3,
					enabled_modes: ['direction']
				})
			}
		},
		motion: {
			label: '运动',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_motion_mode',
					type: 'select',
					label: '模式',
					mode_groups: ['particle', 'motion'],
					options: {
						dynamic: '动态模式',
						parametric: '参数模式',
						static: '静态模式',
					},
				}),
				linear_speed: new Input({
					id: 'particle_motion_linear_speed',
					label: '速度',
					info: '使用发射器形状指定的方向以指定的速度发射粒子',
					enabled_modes: ['dynamic'],
					required: true
				}),
				linear_acceleration: new Input({
					id: 'particle_motion_linear_acceleration',
					label: '加速度',
					info: '应用于粒子的线性加速度，单位为块/二次方秒',
					axis_count: 3,
					enabled_modes: ['dynamic'],
				}),
				linear_drag_coefficient: new Input({
					id: 'particle_motion_linear_drag_coefficient',
					label: '空气阻力',
					info: '空气阻力的值越高，每帧粒子受到的的阻力越多。',
					enabled_modes: ['dynamic']
				}),
				relative_position: new Input({
					id: 'particle_motion_relative_position',
					label: '偏移',
					info: '设置粒子相对于发射器的位置',
					axis_count: 3,
					enabled_modes: ['parametric']
				}),
				direction: new Input({
					id: 'particle_motion_direction',
					label: '位置',
					info: '设置粒子的3D位置',
					axis_count: 3,
					enabled_modes: ['parametric']
				}),
			}
		},
		rotation: {
			label: '旋转',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_rotation_mode',
					type: 'select',
					label: '模式',
					mode_groups: ['particle', 'rotation'],
					options: {
						dynamic: '动态模式',
						parametric: '参数模式',
					},
				}),
				initial_rotation: new Input({
					id: 'particle_rotation_initial_rotation',
					label: '初始旋转值',
					info: '设置初始旋转值，单位为度',
					enabled_modes: ['dynamic']
				}),
				rotation_rate: new Input({
					id: 'particle_rotation_rotation_rate',
					label: '速度',
					info: '设置旋转速度，单位为度/秒',
					enabled_modes: ['dynamic']
				}),
				rotation_acceleration: new Input({
					id: 'particle_rotation_rotation_acceleration',
					label: '加速度',
					info: '设置对粒子的旋转速度施加的加速度，单位为度/二次方秒',
					enabled_modes: ['dynamic']
				}),
				rotation_drag_coefficient: new Input({
					id: 'particle_rotation_rotation_drag_coefficient',
					label: '空气阻力',
					info: '设置旋转时受到的空气阻力',
					enabled_modes: ['dynamic']
				}),
				rotation: new Input({
					id: 'particle_rotation_rotation',
					label: '旋转值',
					info: '设置粒子的旋转值',
					enabled_modes: ['parametric']
				})
			}
		},
		lifetime: {
			label: '生命周期',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_lifetime_mode',
					type: 'select',
					label: '模式',
					mode_groups: ['particle', 'lifetime'],
					options: {
						time: '时长模式',
						expression: '表达式模式',
					}
				}),
				max_lifetime: new Input({
					id: 'particle_lifetime_max_lifetime',
					label: '最大寿命',
					info: '填写粒子的最大寿命（以秒为单位）',
					value: 1,
					enabled_modes: ['time']
				}),
				kill_plane: new Input({
					id: 'particle_lifetime_kill_plane',
					label: '截止平面',
					type: 'number',
					info: '越过该平面的粒子将消失；平面相对于发射器，但面向世界空间。 这4个参数是平面方程式的4个值',
					axis_count: 4
				}),
				expiration_expression: new Input({
					id: 'particle_lifetime_expiration_expression',
					label: '截止表达式',
					info: '表达式的值不为零时粒子将消失',
					enabled_modes: ['expression']
				}),
				expire_in: new Input({
					id: 'particle_lifetime_expire_in',
					label: '截止方块',
					info: '粒子接触到列表内的方块时将消失',
					placeholder: 'minecraft:stone',
					axis_count: -1,
					type: 'text'
				}),
				expire_outside: new Input({
					id: 'particle_lifetime_expire_outside',
					label: '边界方块',
					info: '粒子到列表内的方块外面时将消失',
					placeholder: 'minecraft:air',
					axis_count: -1,
					type: 'text'
				}),
			}
		},
		texture: {
			label: '贴图',
			_folded: true,
			inputs: {
				path: new Input({
					id: 'particle_texture_path',
					type: 'text',
					info: '填写粒子特效贴图在资源包内的路径，例如: textures/particle/default',
					placeholder: 'textures/particle/particles',
					label: '贴图路径',
					updatePreview: function() {
						updateMaterial()
					}
				}),
				image: new Input({
					id: 'particle_texture_image',
					type: 'image',
					allow_upload: !vscode,
					updatePreview: function(src) {
						updateMaterial()
					}
				}),
				mode: new Input({
					id: 'particle_texture_mode',
					type: 'select',
					label: 'UV模式',
					mode_groups: ['particle', 'texture'],
					options: {
						static: '静态模式',
						animated: '动态模式',
					},
				}),
				size: new Input({
					id: 'particle_texture_size',
					label: '贴图尺寸',
					info: '填写UV贴图的分辨率',
					type: 'number',
					axis_count: 2,
					required: true,
					value: [16, 16]
				}),
				uv: new Input({
					id: 'particle_texture_uv',
					label: 'UV起始点',
					info: '填写UV起始坐标',
					axis_count: 2,
					required: true,
					value: [0, 0]
				}),
				uv_size: new Input({
					id: 'particle_texture_uv_size',
					label: 'UV尺寸',
					info: '填写UV尺寸的长宽',
					axis_count: 2,
					value: [16, 16]
				}),
				uv_step: new Input({
					id: 'particle_texture_uv_step',
					label: 'UV偏移',
					info: '填写UV每帧偏移量',
					axis_count: 2,
					enabled_modes: ['animated']
				}),
				frames_per_second: new Input({
					id: 'particle_texture_frames_per_second',
					label: 'FPS',
					info: '填写每秒动态帧数',
					type: 'number',
					enabled_modes: ['animated']
				}),
				max_frame: new Input({
					id: 'particle_texture_max_frame',
					label: '最大帧数',
					info: '填写绘制的最大帧数',
					enabled_modes: ['animated']
				}),
				stretch_to_lifetime: new Input({
					id: 'particle_texture_stretch_to_lifetime',
					label: '同步生命周期',
					type: 'checkbox',
					enabled_modes: ['animated']
				}),
				loop: new Input({
					id: 'particle_texture_loop',
					label: '贴图循环',
					type: 'checkbox',
					enabled_modes: ['animated']
				}),
			}
		},
		color: {
			label: '颜色&光照',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_color_mode',
					type: 'select',
					label: '颜色模式',
					mode_groups: ['particle', 'color'],
					options: {
						static: '静态模式',
						gradient: '渐变模式',
						expression: '表达式模式',
					},
				}),
				picker: new Input({
					id: 'particle_color_static',
					label: '颜色',
					type: 'color',
					enabled_modes: ['static'],
					info: '设置所有发射粒子的静态颜色（材质为“Blend”时，支持透明度）'
				}),
				interpolant: new Input({
					id: 'particle_color_interpolant',
					label: '渐变插值',
					info: '填写颜色渐变的粒子曲线',
					enabled_modes: ['gradient']
				}),
				range: new Input({
					id: 'particle_color_range',
					label: '范围',
					info: '填写颜色渐变度数',
					type: 'number',
					value: 1,
					enabled_modes: ['gradient']
				}),
				gradient: new Gradient({
					id: 'particle_color_gradient',
					label: '渐变',
					info: '调整渐变颜色范围',
					type: 'gradient',
					enabled_modes: ['gradient']
				}),
				expression: new Input({
					id: 'particle_color_expression',
					label: '颜色r',
					info: '在0和1之间的RGBA通道中，使用MoLang表达式设置每个粒子的颜色。Alpha通道显示仅支持“Blend”材质',
					axis_count: 4,
					enabled_modes: ['expression']
				}),
				light: new Input({
					id: 'particle_color_light',
					label: '启用环境光',
					type: 'checkbox',
				}),
			}
		},
		collision: {
			label: '碰撞',
			_folded: true,
			inputs: {
				enabled: new Input({
					id: 'particle_collision_enabled',
					label: '碰撞启用式',
					info: '当填写的表达式的值为真或非零时或未设置时启用碰撞',
				}),
				collision_drag: new Input({
					id: 'particle_collision_collision_drag',
					label: '碰撞阻力',
					info: '粒子碰撞时改变速度',
					type: 'number',
				}),
				coefficient_of_restitution: new Input({
					id: 'particle_collision_coefficient_of_restitution',
					label: '碰撞弹力',
					info: '设置为0.0时表示不反弹，设置为1.0时表示反弹至初始高度',
					type: 'number',
				}),
				collision_radius: new Input({
					id: 'particle_collision_collision_radius',
					label: '碰撞半径',
					info: '最小化粒子与环境的互穿',
					max: 0.5,
					required: true,
					type: 'number',
				}),
				expire_on_contact: new Input({
					id: 'particle_collision_expire_on_contact',
					label: '碰撞消失',
					info: '粒子碰撞到方块时将消失',
					type: 'checkbox',
				}),
			}
		}
	}
};


function forEachInput(cb) {
	for (var k_subject in Data) {
		for (var k_group in Data[k_subject]) {
			var group = Data[k_subject][k_group]
			if (typeof group === 'object') {
				for (var key in group.inputs) {
					if (group.inputs[key] instanceof Input) {
						cb(group.inputs[key], key)
					}
				}
			}
		}
	}
}
//Setup Data
forEachInput(input => {
	if (input.type === 'select') {
		input.update(Data)
	}
})

window.Data = Data;
export default Data
export {forEachInput}
