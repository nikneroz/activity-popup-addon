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
