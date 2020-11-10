<?php
/**
 * Plugin Name: Activity Popup Add-on
 * Plugin URI:  https://brightlab.solutions.com/
 * Description: Example plugin to show developers how to add their own settings into BuddyBoss Platform.
 * Author:      BuddyBoss
 * Author URI:  https://brightlab.solutions.com/
 * Version:     1.0.0
 * Text Domain: activity-popup-addon
 * Domain Path: /languages/
 * License:     GPLv3 or later (license.txt)
 */

/**
 * This file should always remain compatible with the minimum version of
 * PHP supported by WordPress.
 */

// Exit if accessed directly
defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'ACTIVITYPA_BB_Platform_Addon' ) ) {

	/**
	 * Main MYPlugin Custom Emails Class
	 *
	 * @class ACTIVITYPA_BB_Platform_Addon
	 * @version	1.0.0
	 */
	final class ACTIVITYPA_BB_Platform_Addon {

		/**
		 * @var ACTIVITYPA_BB_Platform_Addon The single instance of the class
		 * @since 1.0.0
		 */
		protected static $_instance = null;

		/**
		 * Main ACTIVITYPA_BB_Platform_Addon Instance
		 *
		 * Ensures only one instance of ACTIVITYPA_BB_Platform_Addon is loaded or can be loaded.
		 *
		 * @since 1.0.0
		 * @static
		 * @see ACTIVITYPA_BB_Platform_Addon()
		 * @return ACTIVITYPA_BB_Platform_Addon - Main instance
		 */
		public static function instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		/**
		 * Cloning is forbidden.
		 * @since 1.0.0
		 */
		public function __clone() {
			_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'activity-popup-addon' ), '1.0.0' );
		}
		/**
		 * Unserializing instances of this class is forbidden.
		 * @since 1.0.0
		 */
		public function __wakeup() {
			_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'activity-popup-addon' ), '1.0.0' );
		}

		/**
		 * ACTIVITYPA_BB_Platform_Addon Constructor.
		 */
		public function __construct() {
			$this->define_constants();
			$this->includes();
			// Set up localisation.
			$this->load_plugin_textdomain();
		}

		/**
		 * Define WCE Constants
		 */
		private function define_constants() {
			$this->define( 'ACTIVITYPA_BB_ADDON_PLUGIN_FILE', __FILE__ );
			$this->define( 'ACTIVITYPA_BB_ADDON_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
			$this->define( 'ACTIVITYPA_BB_ADDON_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
			$this->define( 'ACTIVITYPA_BB_ADDON_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
		}

		/**
		 * Define constant if not already set
		 * @param  string $name
		 * @param  string|bool $value
		 */
		private function define( $name, $value ) {
			if ( ! defined( $name ) ) {
				define( $name, $value );
			}
		}

		/**
		 * Include required core files used in admin and on the frontend.
		 */
		public function includes() {
			include_once( 'functions.php' );
		}

		/**
		 * Get the plugin url.
		 * @return string
		 */
		public function plugin_url() {
			return untrailingslashit( plugins_url( '/', __FILE__ ) );
		}

		/**
		 * Get the plugin path.
		 * @return string
		 */
		public function plugin_path() {
			return untrailingslashit( plugin_dir_path( __FILE__ ) );
		}

		/**
		 * Load Localisation files.
		 *
		 * Note: the first-loaded translation file overrides any following ones if the same translation is present.
		 */
		public function load_plugin_textdomain() {
			$locale = is_admin() && function_exists( 'get_user_locale' ) ? get_user_locale() : get_locale();
			$locale = apply_filters( 'plugin_locale', $locale, 'activity-popup-addon' );

			unload_textdomain( 'activity-popup-addon' );
			load_textdomain( 'activity-popup-addon', WP_LANG_DIR . '/' . plugin_basename( dirname( __FILE__ ) ) . '/' . plugin_basename( dirname( __FILE__ ) ) . '-' . $locale . '.mo' );
			load_plugin_textdomain( 'activity-popup-addon', false, plugin_basename( dirname( __FILE__ ) ) . '/languages' );
		}
	}

	/**
	 * Returns the main instance of ACTIVITYPA_BB_Platform_Addon to prevent the need to use globals.
	 *
	 * @since  1.0.0
	 * @return ACTIVITYPA_BB_Platform_Addon
	 */
	function ACTIVITYPA_BB_Platform_Addon() {
		return ACTIVITYPA_BB_Platform_Addon::instance();
	}

	function ACTIVITYPA_BB_Platform_install_bb_platform_notice() {
		echo '<div class="error fade"><p>';
		_e('<strong>Activity Popup Add-on</strong></a> requires the BuddyBoss Platform plugin to work. Please <a href="https://buddyboss.com/platform/" target="_blank">install BuddyBoss Platform</a> first.', 'activity-popup-addon');
		echo '</p></div>';
	}

	function ACTIVITYPA_BB_Platform_update_bb_platform_notice() {
		echo '<div class="error fade"><p>';
		_e('<strong>Activity Popup Add-on</strong></a> requires BuddyBoss Platform plugin version 1.2.6 or higher to work. Please update BuddyBoss Platform.', 'activity-popup-addon');
		echo '</p></div>';
	}

	function ACTIVITYPA_BB_Platform_is_active() {
		if ( defined( 'BP_PLATFORM_VERSION' ) && version_compare( BP_PLATFORM_VERSION,'1.2.6', '>=' ) ) {
			return true;
		}
		return false;
	}

	function ACTIVITYPA_BB_Platform_init() {
		if ( ! defined( 'BP_PLATFORM_VERSION' ) ) {
			add_action( 'admin_notices', 'ACTIVITYPA_BB_Platform_install_bb_platform_notice' );
			add_action( 'network_admin_notices', 'ACTIVITYPA_BB_Platform_install_bb_platform_notice' );
			return;
		}

		if ( version_compare( BP_PLATFORM_VERSION,'1.2.6', '<' ) ) {
			add_action( 'admin_notices', 'ACTIVITYPA_BB_Platform_update_bb_platform_notice' );
			add_action( 'network_admin_notices', 'ACTIVITYPA_BB_Platform_update_bb_platform_notice' );
			return;
		}

		ACTIVITYPA_BB_Platform_Addon();
	}

	add_action( 'plugins_loaded', 'ACTIVITYPA_BB_Platform_init', 9 );
}
