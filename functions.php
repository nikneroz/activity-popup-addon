<?php
// Exit if accessed directly
defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'ACTIVITYPA_admin_enqueue_script' ) ) {
	function ACTIVITYPA_admin_enqueue_script() {
		wp_enqueue_style( 'buddyboss-addon-admin-css', plugin_dir_url( __FILE__ ) . 'style.css' );
	}

	add_action( 'admin_enqueue_scripts', 'ACTIVITYPA_admin_enqueue_script' );
}

if ( ! function_exists( 'ACTIVITYPA_get_settings_sections' ) ) {
	function ACTIVITYPA_get_settings_sections() {

		$settings = array(
			'ACTIVITYPA_settings_section' => array(
				'page'  => 'addon',
				'title' => __( 'Activity Popup Settings', 'activity-popup-addon' ),
			),
		);

		return (array) apply_filters( 'ACTIVITYPA_get_settings_sections', $settings );
	}
}

if ( ! function_exists( 'ACTIVITYPA_get_settings_fields_for_section' ) ) {
	function ACTIVITYPA_get_settings_fields_for_section( $section_id = '' ) {

		// Bail if section is empty
		if ( empty( $section_id ) ) {
			return false;
		}

		$fields = ACTIVITYPA_get_settings_fields();
		$retval = isset( $fields[ $section_id ] ) ? $fields[ $section_id ] : false;

		return (array) apply_filters( 'ACTIVITYPA_get_settings_fields_for_section', $retval, $section_id );
	}
}

if ( ! function_exists( 'ACTIVITYPA_get_settings_fields' ) ) {
	function ACTIVITYPA_get_settings_fields() {

		$fields = array();

		$fields['ACTIVITYPA_settings_section'] = array(

			'ACTIVITYPA_field' => array(
				'title'             => __( 'Activity popup option', 'activity-popup-addon' ),
				'callback'          => 'ACTIVITYPA_settings_callback_field',
				'sanitize_callback' => 'absint',
				'args'              => array(),
			),

		);

		return (array) apply_filters( 'ACTIVITYPA_get_settings_fields', $fields );
	}
}

if ( ! function_exists( 'ACTIVITYPA_settings_callback_field' ) ) {
	function ACTIVITYPA_settings_callback_field() {
		?>
        <input name="ACTIVITYPA_field"
               id="ACTIVITYPA_field"
               type="checkbox"
               value="1"
			<?php checked( ACTIVITYPA_is_addon_field_enabled() ); ?>
        />
        <label for="ACTIVITYPA_field">
			<?php _e( 'Enable this option', 'activity-popup-addon' ); ?>
        </label>
		<?php
	}
}

if ( ! function_exists( 'ACTIVITYPA_is_addon_field_enabled' ) ) {
	function ACTIVITYPA_is_addon_field_enabled( $default = 1 ) {
		return (bool) apply_filters( 'ACTIVITYPA_is_addon_field_enabled', (bool) get_option( 'ACTIVITYPA_field', $default ) );
	}
}

/***************************** Add section in current settings ***************************************/

/**
 * Register fields for settings hooks
 * bp_admin_setting_general_register_fields
 * bp_admin_setting_xprofile_register_fields
 * bp_admin_setting_groups_register_fields
 * bp_admin_setting_forums_register_fields
 * bp_admin_setting_activity_register_fields
 * bp_admin_setting_media_register_fields
 * bp_admin_setting_friends_register_fields
 * bp_admin_setting_invites_register_fields
 * bp_admin_setting_search_register_fields
 */
if ( ! function_exists( 'ACTIVITYPA_bp_admin_setting_general_register_fields' ) ) {
    function ACTIVITYPA_bp_admin_setting_general_register_fields( $setting ) {
	    // Main General Settings Section
	    $setting->add_section( 'ACTIVITYPA_addon', __( 'Popup Settings', 'activity-popup-addon' ) );

	    $args          = array();
	    $setting->add_field( 'bp-enable-my-addon', __( 'URL Field', 'activity-popup-addon' ), 'ACTIVITYPA_admin_general_setting_callback_my_addon', 'intval', $args );
    }

	add_action( 'bp_admin_setting_activity_register_fields', 'ACTIVITYPA_bp_admin_setting_general_register_fields' );
}

if ( ! function_exists( 'ACTIVITYPA_admin_general_setting_callback_my_addon' ) ) {
	function ACTIVITYPA_admin_general_setting_callback_my_addon() {
		?>
        <input id="bp-enable-my-addon" name="bp-enable-my-addon" type="checkbox"
               value="1" <?php checked( ACTIVITYPA_enable_my_addon() ); ?> />
        <label for="bp-enable-my-addon"><?php _e( 'Enable my option', 'activity-popup-addon' ); ?></label>
		<?php
	}
}

if ( ! function_exists( 'ACTIVITYPA_enable_my_addon' ) ) {
	function ACTIVITYPA_enable_my_addon( $default = false ) {
		return (bool) apply_filters( 'ACTIVITYPA_enable_my_addon', (bool) bp_get_option( 'bp-enable-my-addon', $default ) );
	}
}


/**************************************** MY PLUGIN INTEGRATION ************************************/

/**
 * Set up the my plugin integration.
 */
function ACTIVITYPA_register_integration() {
	require_once dirname( __FILE__ ) . '/integration/buddyboss-integration.php';
	buddypress()->integrations['addon'] = new ACTIVITYPA_BuddyBoss_Integration();
}
add_action( 'bp_setup_integrations', 'ACTIVITYPA_register_integration' );


function enqueue_plugin_scripts() {
    wp_enqueue_script('jquery');
    wp_enqueue_script('jquery-modal-js', plugins_url('js/jquery.modal.min.js', __FILE__), '1.0.0', false);
    wp_enqueue_script('activity-popup-addon-js', plugins_url('js/index.js', __FILE__), '1.0.0', false);
    wp_enqueue_style('jquery-modal-css', plugins_url('css/jquery.modal.min.css', __FILE__), '1.0.0', false);
    wp_enqueue_style('activity-popup-addon-css', plugins_url('css/index.css', __FILE__), '1.0.0', false);
}

function add_buy_button() {
	global $activities_template;
  $activity = $activities_template->activity;

  $current_user = wp_get_current_user();
  $current_user_id = $current_user->ID;
  $post_code = bp_get_profile_field_data([
    'field' => 'Post Code',
    'user_id' => $current_user_id
  ]);
  $community = bp_get_profile_field_data([
    'field' => 'Community',
    'user_id' => $current_user_id
  ]);

  $activity_user_id = $activity->user_id;
  $activity_user = get_userdata($activity_user_id);

  $is_menu_post = strpos($activity->content, '#menu') !== false;

  if ($is_menu_post && in_array("administrator", $activity_user->roles)) {
    echo "<div class='generic-button'><a href='http://localhost:8888?post_code=$post_code' target='_blank' class='catalog-button'>Buy Now($community)</a></div>";
  }
}

function add_activity_state_class($class = '') {
	global $activities_template;

  $current_user_id = wp_get_current_user()->ID;
  $community = bp_get_profile_field_data([
    'field' => 'Community',
    'user_id' => $current_user_id
  ]);

  $community_tag = '#' . preg_replace('/\s+/', '', $community);
  $activity = $activities_template->activity;
  $activity_user_id = $activity->user_id;
  $activity_user = get_userdata($activity_user_id);
  $can_post_menu = in_array("administrator", $activity_user->roles);

  $is_menu_post = strpos($activity->content, '#menu') !== false;

  if ($is_menu_post && $can_post_menu && !current_user_can('administrator')) {
    $visible_community = strpos($activity->content, $community_tag) !== false;
    $state = $visible_community ? "visible" : "hidden";
    $class .= " activity-$state";
  }
	return $class;
}

add_action('wp_enqueue_scripts', 'enqueue_plugin_scripts');
add_action('bp_activity_entry_meta', 'add_buy_button');
add_filter('bp_get_activity_css_class', 'add_activity_state_class');
