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
    global $post;

    if ($post->post_name == 'news-feed') {
      wp_enqueue_script('jquery');

      wp_enqueue_script('stripe', 'https://js.stripe.com/v3/');
      wp_enqueue_script('jquery-modal-js', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js');
      wp_enqueue_style('jquery-modal-css', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css');
      wp_enqueue_script('activity-popup-addon-js', plugins_url('js/news-feed.js', __FILE__), '1.0.0', false);
      wp_enqueue_style('news-feed-css', plugins_url('css/news-feed.css', __FILE__), '1.0.0', false);
      wp_enqueue_style('news-feed-checkout-css', plugins_url('css/news-feed-checkout.css', __FILE__), '1.0.0', false);
    }
}

function get_user_field($user_id, $field){
  return bp_get_profile_field_data([
    'field' => $field,
    'user_id' => $user_id
  ]);
}

function add_buy_button() {
	global $activities_template;
  $activity = $activities_template->activity;

  $current_user = wp_get_current_user();
  $current_user_id = $current_user->ID;
  $post_code = get_user_field($current_user_id, 'Post Code');
  $community = get_user_field($current_user_id, 'Community');
  $first_name = get_user_field($current_user_id, 'First Name');
  $last_name = get_user_field($current_user_id, 'Last Name');
  $phone = get_user_field($current_user_id, 'Phone');
  $email = get_user_field($current_user_id, 'Email');
  $address = get_user_field($current_user_id, 'Address 1');

  $activity_user_id = $activity->user_id;
  $activity_user = get_userdata($activity_user_id);

  $is_menu_post = strpos($activity->content, '#menu') !== false;
  preg_match("/#(\w+)LINK/", $activity->content, $links);
  $menu_link = $links[1];

  $minus_image = plugin_dir_url( __FILE__ ) . 'images/minus.svg';
  $plus_image = plugin_dir_url( __FILE__ ) . 'images/plus.svg';
  $button_image = plugin_dir_url( __FILE__ ) . 'images/button.svg';
  
  if ($is_menu_post && in_array("administrator", $activity_user->roles) && $menu_link) {
    $content = "
      <div class='modal' id='$menu_link'>
        <div class='container'></div>
      </div>
      <div class='generic-button buy' data-button='$button_image' data-plus='$plus_image' data-minus='$minus_image' data-first-name='$first_name' data-last-name='$last_name' data-phone='$phone' data-email='$email' data-address='$address'>
        <a href='#' data-id='$menu_link' class='catalog-button menu-button'>
          Order
        </a>
      </div>
    ";
    echo $content;
  }
}

function add_activity_comment_community($name = '') {
  $current_user_id = bp_get_activity_comment_user_id();
  $community = get_user_field($current_user_id, 'Community');
  if ($community == '') {
    return $name;
  } else {
    return "$name - $community";
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

function browse_page_js() {
    global $post;

    if( is_page() || is_single() ) {
        if ($post->post_name == 'browse-menus') {
           wp_enqueue_script('jquery');
           wp_enqueue_script('moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js');
           wp_enqueue_script('browse-menus-js', plugins_url('js/browse.js', __FILE__), '1.0.0', false);
           wp_enqueue_style('browse-menus-css', plugins_url('css/browse.css', __FILE__), '1.0.0', false);

        }
    } 
}

add_action('wp_enqueue_scripts', 'enqueue_plugin_scripts');
add_action('bp_activity_entry_meta', 'add_buy_button');
add_filter('bp_get_activity_css_class', 'add_activity_state_class');
add_filter('bp_activity_comment_name', 'add_activity_comment_community');
add_action('wp_head', 'browse_page_js');
