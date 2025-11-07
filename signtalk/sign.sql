/*
Navicat MySQL Data Transfer

Source Server         : sign
Source Server Version : 80016
Source Host           : localhost:3306
Source Database       : sign

Target Server Type    : MYSQL
Target Server Version : 80016
File Encoding         : 65001

Date: 2025-04-11 16:27:26
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for `auth_group`
-- ----------------------------
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_group
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_group_permissions`
-- ----------------------------
DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_group_permissions
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_permission`
-- ----------------------------
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_permission
-- ----------------------------
INSERT INTO auth_permission VALUES ('1', 'Can add log entry', '1', 'add_logentry');
INSERT INTO auth_permission VALUES ('2', 'Can change log entry', '1', 'change_logentry');
INSERT INTO auth_permission VALUES ('3', 'Can delete log entry', '1', 'delete_logentry');
INSERT INTO auth_permission VALUES ('4', 'Can view log entry', '1', 'view_logentry');
INSERT INTO auth_permission VALUES ('5', 'Can add permission', '2', 'add_permission');
INSERT INTO auth_permission VALUES ('6', 'Can change permission', '2', 'change_permission');
INSERT INTO auth_permission VALUES ('7', 'Can delete permission', '2', 'delete_permission');
INSERT INTO auth_permission VALUES ('8', 'Can view permission', '2', 'view_permission');
INSERT INTO auth_permission VALUES ('9', 'Can add group', '3', 'add_group');
INSERT INTO auth_permission VALUES ('10', 'Can change group', '3', 'change_group');
INSERT INTO auth_permission VALUES ('11', 'Can delete group', '3', 'delete_group');
INSERT INTO auth_permission VALUES ('12', 'Can view group', '3', 'view_group');
INSERT INTO auth_permission VALUES ('13', 'Can add user', '4', 'add_user');
INSERT INTO auth_permission VALUES ('14', 'Can change user', '4', 'change_user');
INSERT INTO auth_permission VALUES ('15', 'Can delete user', '4', 'delete_user');
INSERT INTO auth_permission VALUES ('16', 'Can view user', '4', 'view_user');
INSERT INTO auth_permission VALUES ('17', 'Can add content type', '5', 'add_contenttype');
INSERT INTO auth_permission VALUES ('18', 'Can change content type', '5', 'change_contenttype');
INSERT INTO auth_permission VALUES ('19', 'Can delete content type', '5', 'delete_contenttype');
INSERT INTO auth_permission VALUES ('20', 'Can view content type', '5', 'view_contenttype');
INSERT INTO auth_permission VALUES ('21', 'Can add session', '6', 'add_session');
INSERT INTO auth_permission VALUES ('22', 'Can change session', '6', 'change_session');
INSERT INTO auth_permission VALUES ('23', 'Can delete session', '6', 'delete_session');
INSERT INTO auth_permission VALUES ('24', 'Can view session', '6', 'view_session');
INSERT INTO auth_permission VALUES ('25', 'Can add user', '7', 'add_user');
INSERT INTO auth_permission VALUES ('26', 'Can change user', '7', 'change_user');
INSERT INTO auth_permission VALUES ('27', 'Can delete user', '7', 'delete_user');
INSERT INTO auth_permission VALUES ('28', 'Can view user', '7', 'view_user');
INSERT INTO auth_permission VALUES ('29', 'Can add 手语词汇', '8', 'add_word');
INSERT INTO auth_permission VALUES ('30', 'Can change 手语词汇', '8', 'change_word');
INSERT INTO auth_permission VALUES ('31', 'Can delete 手语词汇', '8', 'delete_word');
INSERT INTO auth_permission VALUES ('32', 'Can view 手语词汇', '8', 'view_word');
INSERT INTO auth_permission VALUES ('33', 'Can add 手语分类', '9', 'add_category');
INSERT INTO auth_permission VALUES ('34', 'Can change 手语分类', '9', 'change_category');
INSERT INTO auth_permission VALUES ('35', 'Can delete 手语分类', '9', 'delete_category');
INSERT INTO auth_permission VALUES ('36', 'Can view 手语分类', '9', 'view_category');

-- ----------------------------
-- Table structure for `auth_user`
-- ----------------------------
DROP TABLE IF EXISTS `auth_user`;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_user_groups`
-- ----------------------------
DROP TABLE IF EXISTS `auth_user_groups`;
CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user_groups
-- ----------------------------

-- ----------------------------
-- Table structure for `auth_user_user_permissions`
-- ----------------------------
DROP TABLE IF EXISTS `auth_user_user_permissions`;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user_user_permissions
-- ----------------------------

-- ----------------------------
-- Table structure for `django_admin_log`
-- ----------------------------
DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_admin_log
-- ----------------------------

-- ----------------------------
-- Table structure for `django_content_type`
-- ----------------------------
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_content_type
-- ----------------------------
INSERT INTO django_content_type VALUES ('1', 'admin', 'logentry');
INSERT INTO django_content_type VALUES ('3', 'auth', 'group');
INSERT INTO django_content_type VALUES ('2', 'auth', 'permission');
INSERT INTO django_content_type VALUES ('4', 'auth', 'user');
INSERT INTO django_content_type VALUES ('5', 'contenttypes', 'contenttype');
INSERT INTO django_content_type VALUES ('6', 'sessions', 'session');
INSERT INTO django_content_type VALUES ('7', 'userauth', 'user');
INSERT INTO django_content_type VALUES ('9', 'words', 'category');
INSERT INTO django_content_type VALUES ('8', 'words', 'word');

-- ----------------------------
-- Table structure for `django_migrations`
-- ----------------------------
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_migrations
-- ----------------------------
INSERT INTO django_migrations VALUES ('1', 'contenttypes', '0001_initial', '2025-03-12 08:59:25.814008');
INSERT INTO django_migrations VALUES ('2', 'auth', '0001_initial', '2025-03-12 08:59:26.311135');
INSERT INTO django_migrations VALUES ('3', 'admin', '0001_initial', '2025-03-12 08:59:26.425179');
INSERT INTO django_migrations VALUES ('4', 'admin', '0002_logentry_remove_auto_add', '2025-03-12 08:59:26.431197');
INSERT INTO django_migrations VALUES ('5', 'admin', '0003_logentry_add_action_flag_choices', '2025-03-12 08:59:26.438192');
INSERT INTO django_migrations VALUES ('6', 'contenttypes', '0002_remove_content_type_name', '2025-03-12 08:59:26.523209');
INSERT INTO django_migrations VALUES ('7', 'auth', '0002_alter_permission_name_max_length', '2025-03-12 08:59:26.580310');
INSERT INTO django_migrations VALUES ('8', 'auth', '0003_alter_user_email_max_length', '2025-03-12 08:59:26.633311');
INSERT INTO django_migrations VALUES ('9', 'auth', '0004_alter_user_username_opts', '2025-03-12 08:59:26.640291');
INSERT INTO django_migrations VALUES ('10', 'auth', '0005_alter_user_last_login_null', '2025-03-12 08:59:26.708333');
INSERT INTO django_migrations VALUES ('11', 'auth', '0006_require_contenttypes_0002', '2025-03-12 08:59:26.711333');
INSERT INTO django_migrations VALUES ('12', 'auth', '0007_alter_validators_add_error_messages', '2025-03-12 08:59:26.717335');
INSERT INTO django_migrations VALUES ('13', 'auth', '0008_alter_user_username_max_length', '2025-03-12 08:59:26.770349');
INSERT INTO django_migrations VALUES ('14', 'auth', '0009_alter_user_last_name_max_length', '2025-03-12 08:59:26.832334');
INSERT INTO django_migrations VALUES ('15', 'auth', '0010_alter_group_name_max_length', '2025-03-12 08:59:26.902334');
INSERT INTO django_migrations VALUES ('16', 'auth', '0011_update_proxy_permissions', '2025-03-12 08:59:26.908333');
INSERT INTO django_migrations VALUES ('17', 'auth', '0012_alter_user_first_name_max_length', '2025-03-12 08:59:26.960353');
INSERT INTO django_migrations VALUES ('18', 'sessions', '0001_initial', '2025-03-12 08:59:26.991335');
INSERT INTO django_migrations VALUES ('19', 'userauth', '0001_initial', '2025-03-12 08:59:27.037336');
INSERT INTO django_migrations VALUES ('20', 'userauth', '0002_remove_user_created_at', '2025-03-13 14:00:22.897894');
INSERT INTO django_migrations VALUES ('23', 'words', '0001_initial', '2025-03-29 14:19:44.458191');

-- ----------------------------
-- Table structure for `django_session`
-- ----------------------------
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_session
-- ----------------------------

-- ----------------------------
-- Table structure for `userauth_user`
-- ----------------------------
DROP TABLE IF EXISTS `userauth_user`;
CREATE TABLE `userauth_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of userauth_user
-- ----------------------------
INSERT INTO userauth_user VALUES ('1', 'admin', 'pbkdf2_sha256$600000$00CaM1QGDu1eK5RF6wxLG8$PUuKcGnW7lFInShTb4Wv00W8osZQXi8gr+yyxrAjkE4=');
INSERT INTO userauth_user VALUES ('2', '1', 'pbkdf2_sha256$600000$Mi9RG7g89LwyAEs7HmZgKV$LOzGRSZebedyzZcmpOpulMbj3Xd8qsxZNnPwSSYPd7s=');
INSERT INTO userauth_user VALUES ('3', 'ggg', 'pbkdf2_sha256$600000$z8mQWJtfvzTWdz9w6T2VHw$jqL38Cn0u2CJBwaiFc7D0m+oYFCm0EKMC4RkO5SQoH8=');
INSERT INTO userauth_user VALUES ('4', 'a', 'pbkdf2_sha256$600000$he3jOpOflBGMQpVvZLX7D3$IhulCSlx6R2kTXIIVFjvnVNszkgIEx09EcZfwoE5sYY=');

-- ----------------------------
-- Table structure for `words_category`
-- ----------------------------
DROP TABLE IF EXISTS `words_category`;
CREATE TABLE `words_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of words_category
-- ----------------------------
INSERT INTO words_category VALUES ('1', '计量单位');
INSERT INTO words_category VALUES ('2', '方位');
INSERT INTO words_category VALUES ('3', '形状');
INSERT INTO words_category VALUES ('4', '颜色');
INSERT INTO words_category VALUES ('5', '天气');

-- ----------------------------
-- Table structure for `words_word`
-- ----------------------------
DROP TABLE IF EXISTS `words_word`;
CREATE TABLE `words_word` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `word` varchar(100) NOT NULL,
  `pinyin` varchar(100) NOT NULL,
  `video_url` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `category_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `words_word_category_id_3b25542f_fk_words_category_id` (`category_id`),
  CONSTRAINT `words_word_category_id_3b25542f_fk_words_category_id` FOREIGN KEY (`category_id`) REFERENCES `words_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of words_word
-- ----------------------------
INSERT INTO words_word VALUES ('1', '一角', 'yījiǎo', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/cc0bd4623270835010647682627/EVUFq7rh4NIA.mp4', '一手伸食指，指尖朝前，向下点两下（表示两角钱时，一手伸食、中指，指尖朝前，向下点两下，以此类推）。', '1');
INSERT INTO words_word VALUES ('2', '微米（μm）', 'wēimǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/c2a6bebc3270835010647275641/4qgjsafQPmYA.mp4', '一手连续打手指字母“ U”“ M”的指式，表示微米的法定计量单位符号。', '1');
INSERT INTO words_word VALUES ('3', '克', 'kè', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/e24d06f03270835010644519010/RvOOTkmwcYIA.mp4', '左手横伸；右手打手指字母“ K”的指式，置于左手掌心上，双手同时向下一顿。', '1');
INSERT INTO words_word VALUES ('4', '纳米（nm）', 'nàmǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/239938183270835010645011858/qJpk1wswF2sA.mp4', '一手连续打手指字母“ N”“ M”的指式，表示纳米的法定计量单位符号。', '1');
INSERT INTO words_word VALUES ('5', '分贝（dB）', 'fēnbèi', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/3cf510f43270835010642055741/YM0qeatAEvIA.mp4', '一手食指直立，其他四指相捏，虎口朝内，仿小写拉丁字母“ d”的形状，然后打手指字母“ B”的指式，表示分贝的单位符号。', '1');
INSERT INTO words_word VALUES ('6', '分米（dm）', 'fēnmǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/ac6741543270835010640465333/Wwpr700n2MkA.mp4', '一手食指直立，其他四指相捏，虎口朝内，仿小写拉丁字母“ d”的形状，然后打手指字母“ M”的指式，表示分米的法定计量单位符号。', '1');
INSERT INTO words_word VALUES ('7', '米（m）', 'mǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/93434afe3270835010643454198/b9Hq2aV3IsYA.mp4', '一手打手指字母“ M”的指式，表示米的法定计量单位符号。', '1');
INSERT INTO words_word VALUES ('8', '百分数（百分率）', 'bǎifēnshù（bǎifēnlǜ）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/ac8ca5673270835010640487996/HmFvf4B6vAYA.mp4', '（一）一手伸食指，指尖朝前，书空“ %”。\n（二）一手直立，掌心向内，五指张开，交替点动几下。', '1');
INSERT INTO words_word VALUES ('9', '尺（一尺）', 'chǐ（yīchǐ）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/b37726323270835010640772141/XyPxTKNx2YkA.mp4', '双手食指直立，指面左右相对，相距约30厘米，表示长度一尺（表示二尺时，双手向一侧移动一下；超过三尺时，先打相应的数字手势，再打此手势）。', '1');
INSERT INTO words_word VALUES ('10', '对（一对）', 'duì（yīduì）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/f284aa5e3270835010641182994/8dUkorxRaCYA.mp4', '双手伸食指，指尖朝前，手背向上，从两侧向中间移动。', '1');
INSERT INTO words_word VALUES ('11', '一分', 'yīfēn', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/11c17be83270835010648348579/6HGmNTMznz4A.mp4', '左手拇、食指捏成圆形，虎口朝上；右手伸食指，指尖朝前，手背向上，边蹭左手拇指尖边向右微动两下，表示一分钱（表示两分钱时，右手伸食、中指，指尖朝前，手背向上，边蹭左手拇指尖边向右微动两下，以此类推）。', '1');
INSERT INTO words_word VALUES ('12', '届（一届）', ' jiè（yījiè）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/dbde51c23270835010644299068/xYnQkIU2iEsA.mp4', '左手握拳，手背向外；右手食指横伸，手背向外，在左手背上点一下。', '1');
INSERT INTO words_word VALUES ('13', '一元 ', 'yīyuán', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/2006a80a3270835010648984728/H8rstILbmuoA.mp4', '一手食指直立，掌心向内，从颏部向外移出少许（表示两元钱时，一手食、中指直立分开，掌心向内，从颏部向外移出少许，以此类推）。', '1');
INSERT INTO words_word VALUES ('14', '毫米（mm）', 'háomǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/f2765a973270835010641179603/BoaJXMNZTwAA.mp4', '一手连续打两下手指字母“ M”的指式，表示毫米的法定计量单位符号。', '1');
INSERT INTO words_word VALUES ('15', '公斤（千克）', 'gōngjīn（qiānkè）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/b8474d593270835010640995123/m78hj8zoU0UA.mp4', '（一）双手拇、食指搭成“ 公”字形，虎口朝外。\n（二）双手拇、食指相捏，指尖朝下，向上微移一下。', '1');
INSERT INTO words_word VALUES ('16', '厘米（cm）', 'límǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/51f486803270835010642957355/sRGe25iX5w4A.mp4', '一手连续打手指字母“ C”“ M”的指式，表示厘米的法定计量单位符号。', '1');
INSERT INTO words_word VALUES ('17', '千米（km、公里）', 'qiānmǐ（gōnglǐ）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/2d70c7433270835010645489067/NAN76ZckOkMA.mp4', '一手连续打手指字母“ K”“ M”的指式，表示千米的法定计量单位符号。', '1');
INSERT INTO words_word VALUES ('18', '那里', 'nàlǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/dff774c23270835010644418876/BaSkseHTzVoA.mp4', '一手伸食指，指尖朝外指两下。（可根据实际决定手指的朝向）', '2');
INSERT INTO words_word VALUES ('19', '前', 'qián', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/3427f8ca3270835010645749678/exCBe1Mfin0A.mp4', '一手伸食指，朝前一指。（可根据实际决定手的朝向）', '2');
INSERT INTO words_word VALUES ('20', '西', 'xī', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/6145743f3270835010649475145/dixAO8LDAzAA.mp4', '左手拇、食指成“ ㄈ”形，虎口朝内；右手食、中指直立分开，手背向内，贴于左手拇指，仿“ 西”字部分字形。', '2');
INSERT INTO words_word VALUES ('21', '东', 'dōng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/4d6cc0743270835010642774301/rE5QCUIDkY0A.mp4', '右手横立，指尖朝右。', '2');
INSERT INTO words_word VALUES ('22', '北', 'běi', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/7288a93a3270835010639352354/lLmhnfa0CkcA.mp4', '右手直立，掌心向左，五指并拢，置于胸前正中。', '2');
INSERT INTO words_word VALUES ('23', '周围', 'zhōuwéi', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/dc7517bd3270835010651089473/dekcDT0QqoEA.mp4', '左手虚握，手背向上；右手伸食指，指尖朝下，绕左手顺时针平行转动一圈。（可根据实际表示周围的意思）', '2');
INSERT INTO words_word VALUES ('24', '右（右面、右边）', 'yòu（yòumiàn、yòubiān）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/60fc867a3270835010649434190/Pt1U7jwyk0QA.mp4', '左手拍一下右臂（或一手伸食指，向右一指）。', '2');
INSERT INTO words_word VALUES ('26', '内（里面）', 'nèi（lǐmiàn）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/3427752c3270835010645748897/Sp9EttDhcYMA.mp4', '左手横立；右手食指直立，在左手掌心内从上向下移动。（可根据实际表示里面的意思）', '2');
INSERT INTO words_word VALUES ('27', '南', 'nán', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/2fc2c2fd3270835010645583732/3HGrfcX9TlEA.mp4', '右手五指并拢，指尖朝下，掌心向左，置于身前正中。', '2');
INSERT INTO words_word VALUES ('28', '下（下面、下边、地）', 'xià（xiàmiàn、xiàbiān、dì）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/c510247d3270835010647389330/WUREyZ2DecwA.mp4', '一手伸食指，指尖朝下一指。', '2');
INSERT INTO words_word VALUES ('29', '后', 'hòu', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/aef196383270835010640593218/cBA7YEN2CT0A.mp4', '一手伸食指，朝肩后一指。', '2');
INSERT INTO words_word VALUES ('30', '向（朝）', 'xiàng（cháo）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/d0cb88a63270835010647898640/1XRPNz5ILEcA.mp4', '双手直立，掌心左右相对，向前移动一下。', '2');
INSERT INTO words_word VALUES ('31', '反面（背面、后面）', 'fǎnmiàn（bèimiàn、hòumiàn）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/3d04d9cf3270835010642061019/vWRUlriUK0YA.mp4', '左手直立，手背向外；右手伸食指，指一下左手背，表示物体的反面。', '2');
INSERT INTO words_word VALUES ('32', '倾向（偏向）', 'qīngxiàng（piānxiàng）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/3669fcc33270835010645837961/lpq18ovr1u4A.mp4', '双手侧立，然后手腕转向一侧。', '2');
INSERT INTO words_word VALUES ('33', '方向 ', 'fāngxiàng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/f23bbbd63270835010641141982/8pp87TtBIuYA.mp4', '（一）双手拇、食指搭成“ ⼞”形。\n（二）双手直立，掌心左右相对，向前移动一下。', '2');
INSERT INTO words_word VALUES ('34', '旁边 ', 'pángbiān', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/8c45971b3270835010643157906/bqQuxlOB9jwA.mp4', '右手五指并拢，拍两下左臂外侧。（可根据实际表示旁边的意思）', '2');
INSERT INTO words_word VALUES ('35', '这里', 'zhèlǐ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/61237cff3270835010649459323/w3rCrr2iB4UA.mp4', '一手伸食指，指尖朝下指两下。（可根据实际决定手指的朝向）', '2');
INSERT INTO words_word VALUES ('36', '正面（前面）', 'zhèngmiàn（qiánmiàn）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/5c3fad7f3270835010649223847/UnU9XB6aUvkA.mp4', '左手直立，掌心向外；右手伸食指，指一下左手掌心，表示物体的正面。', '2');
INSERT INTO words_word VALUES ('37', '上（上面、上边） ', 'shàng（shàngmiàn、shàngbiān）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/eb9d47793270835010644911095/ZA62T15Gb9gA.mp4', '一手食指直立，向上一指。', '2');
INSERT INTO words_word VALUES ('38', '边（边缘、边界）', 'biān（biānyuán、biānjiè）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/6b7696d83270835010639041627/Q4hiImqO9zgA.mp4', '左手横伸，掌心向下；右手食、中、无名、小指并拢，指尖朝下，沿左手小指外侧向右一划。', '2');
INSERT INTO words_word VALUES ('39', '侧面', 'cèmiàn', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/b7a616963270835010640908171/gcrlq55gtmsA.mp4', '左手直立，掌心向外；右手直立，掌心贴于左手拇指，从上向下动一下。', '2');
INSERT INTO words_word VALUES ('40', '对面', 'duìmiàn', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/b7b579f53270835010640913390/DYxcGhYHlIgA.mp4', '双手食指直立，指面前后相对，然后同时向中间微移一下。（可根据实际表示对面的意思）', '2');
INSERT INTO words_word VALUES ('41', '东方', 'dōngfāng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/f2510d783270835010641157572/QXg8e8tBZ74A.mp4', '（一）一手伸食指，在嘴两侧书写“ ハ”，仿“ 东”字部分字形。\n（二）双手拇、食指搭成“ ⼞”形。', '2');
INSERT INTO words_word VALUES ('42', '外（外面）', 'wài（wàimiàn）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/0f7b2e203270835010648252865/yVsWv4FdeMkA.mp4', '左手横立；右手伸食指，指尖朝下，在左手背外向下指。（可根据实际表示外面的意思）', '2');
INSERT INTO words_word VALUES ('43', '橙色', 'chéngsè', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/31163c623270835010638836455/RE0KnIfuS7MA.mp4', '（一）左手虚握，指尖朝上；右手沿左手指背向下扯，如剥橘子皮状。\n（二）一手直立，掌心向内，五指张开，在嘴唇部交替点动。', '4');
INSERT INTO words_word VALUES ('44', '蓝', 'lán', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/9f3842ad3270835010643999487/KHvlEikOa2sA.mp4', '一手打手指字母“ L”的指式，沿胸的一侧划下。（“ 蓝”的手语存在地域差异，可根据实际选择使用）', '4');
INSERT INTO words_word VALUES ('45', '颜色（彩色、色彩）', 'yánsè（cǎisè、sècǎi）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/1b5a20bc3270835010648780603/eZn2A3ZwB9EA.mp4', '一手直立，掌心向内，五指张开，在嘴唇部交替点动。', '4');
INSERT INTO words_word VALUES ('46', '黑', 'hēi', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/8e511f933270835010643215075/oSe1xcujytoA.mp4', '一手打手指字母“ H”的指式，摸一下头发。', '4');
INSERT INTO words_word VALUES ('47', '咖啡色（棕色、褐色）', 'kāfēisè（zōngsè、hèsè）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/8ee057193270835010643292607/XNQPoaiUfegA.mp4', '（一）左手五指成半圆形，虎口朝上；右手打手指字母“ K”的指式，中指尖朝下，在左手虎口内做搅拌的动作。\n（二）一手直立，掌心向内，五指张开，在嘴唇部交替点动。', '4');
INSERT INTO words_word VALUES ('48', '粉红色', 'fěnhóngsè', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/4d91931c3270835010642795801/Zle85knFOocA.mp4', '（一）一手五指撮合，指尖朝上，置于脸颊处，互捻几下。\n（二）一手打手指字母“ H”的指式，摸一下嘴唇。\n（三）一手直立，掌心向内，五指张开，在嘴唇部交替点动。', '4');
INSERT INTO words_word VALUES ('49', '青', 'qīng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/7378ccdd3270835010646190674/FtgA8Tkkmn0A.mp4', '一手横立，掌心向内，食、中、无名、小指并拢，在颏部从右向左摸一下。', '4');
INSERT INTO words_word VALUES ('50', '灰色', 'huīsè', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/95acb93c3270835010643568082/ii5naDnirasA.mp4', '（一）一手拇、食、中指相捏，指尖朝下，互捻几下。\n（二）一手直立，掌心向内，五指张开，在嘴唇部交替点动。', '4');
INSERT INTO words_word VALUES ('51', '白', 'bái', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/793fd1b93270835010639612723/mui5HQSpBXsA.mp4', '一手五指弯曲，掌心向外，指尖弯动两下，表示上下牙齿。', '4');
INSERT INTO words_word VALUES ('52', '黄', 'huáng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/3f2566d03270835010642134235/vfu2bKmb8i4A.mp4', '右手五指张开，掌心向左，晃动几下。（“ 黄”的手语存在地域差异，可根据实际选择使用）', '4');
INSERT INTO words_word VALUES ('53', '红', 'hóng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/48aeb1963270835010642561309/N9yMJSNywZUA.mp4', '一手打手指字母“ H”的指式，摸一下嘴唇。', '4');
INSERT INTO words_word VALUES ('54', '金色', 'jīnsè', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/9a67855a3270835010643775206/soAKPejcHI4A.mp4', '（一）双手伸拇、食、中指，食、中指并拢，交叉相搭，右手中指蹭一下左手食指。\n（二）一手直立，掌心向内，五指张开，在嘴唇部交替点动。', '4');
INSERT INTO words_word VALUES ('55', '四边形', 'sìbiānxíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/c4c7427d3270835010647348605/hBW95b9KYF4A.mp4', '（一）一手食、中、无名、小指直立分开，掌心向外。\n（二）左手横伸，掌心向下；右手食、中、无名、小指并拢，指尖朝下，沿左小臂向指尖方向划动一下。\n（三）双手拇、食指成“└ ┘”形，置于脸颊两侧，上下交替动两下。', '3');
INSERT INTO words_word VALUES ('56', '图形', 'túxíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/0fa2a56a3270835010648278786/8SDu0Hf76WAA.mp4', '（一）左手横伸；右手五指撮合，指背在左手掌心上抹一下。\n（二）双手拇、食指成“ └ ┘”形，置于脸颊两侧，上下交替动两下。', '3');
INSERT INTO words_word VALUES ('57', '角', 'jiǎo', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/95bf72593270835010643579500/EQZDyj9dbokA.mp4', '左手拇、食指成“ ∠”形，手背向内；右手食指沿左手虎口划一下。', '3');
INSERT INTO words_word VALUES ('58', '笔直', 'bǐzhí', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/ac21229e3270835010640429793/EurrnfhqGaMA.mp4', '左手伸食指，指尖朝前；右手侧立，置于左手食指上，然后沿左手食指向前移动。（可根据实际表示笔直的状态）', '3');
INSERT INTO words_word VALUES ('59', '梯形', 'tīxíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/d2b047ff3270835010647931672/vX2xaMfanfYA.mp4', '（一）双手伸食指，指尖朝前，划“ ⏢ ”形。\n（二）双手拇、食指成“ └ ┘”形，置于脸颊两侧，上下交替动两下。', '3');
INSERT INTO words_word VALUES ('60', '直线', 'zhíxiàn', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/983db5df3270835010650407968/P7v4uG956wAA.mp4', '（一）一手侧立，向前移动一下。\n（二）双手拇、食指相捏，虎口朝上，从中间向两侧拉开。', '3');
INSERT INTO words_word VALUES ('61', '流线型', 'liúxiànxíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/d6f9ed563270835010644062383/cLcJafk8bogA.mp4', '左手平伸，手背拱起；右手平伸，掌心向下，从左手指尖向手腕方向快速做弧形移动，嘴同时做吹气的动作。', '3');
INSERT INTO words_word VALUES ('62', '长方形', 'chángfāngxíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/7e32f3573270835010639853003/nz5buUR1J34A.mp4', '（一）双手食指直立，指面相对，从中间向两侧拉开。\n（二）双手拇、食指搭成“ ⼞”形。\n（三）双手拇、食指成“ └ ┘”形，置于脸颊两侧，上下交替动两下。', '3');
INSERT INTO words_word VALUES ('63', '几何', 'jǐhé', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/002bc3b93270835010641737290/v4NKTvSvltUA.mp4', '（一）一手直立，掌心向内，五指张开，交替点动几下。\n（二）左手横伸；右手食、中指分开，食指尖抵于左手掌心，中指转动半圈，如用圆规画圆状。', '3');
INSERT INTO words_word VALUES ('64', '菱形', 'língxíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/52061ebd3270835010642966604/B5WjLrkdwjsA.mp4', '（一）双手食、中指分开，指尖斜向相抵，手背向外，搭成“ ◇”形。\n（二）双手拇、食指成“ └ ┘”形，置于脸颊两侧，上下交替动两下。', '3');
INSERT INTO words_word VALUES ('65', '圆（圆形） ', 'yuán（yuánxíng）', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/8eea1a6c3270835010650009510/OC7sn3AerZ8A.mp4', '双手拇、食指搭成圆形，虎口朝内。', '3');
INSERT INTO words_word VALUES ('67', '弧', 'hú', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/3cce0d2e3270835010642030274/W171qVLAda0A.mp4', '一手伸食指，指尖朝前，划一条弧线。', '3');
INSERT INTO words_word VALUES ('68', '曲线', 'qūxiàn', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/d97225143270835010644180137/D9wVdbjbD28A.mp4', '（一）一手伸食指，指尖朝前，从左向右划曲线。\n（二）双手拇、食指相捏，虎口朝上，从中间向两侧拉开。', '3');
INSERT INTO words_word VALUES ('69', '弯', 'wān', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/0a9cb3953270835010648026441/I3YGnb11CMIA.mp4', '左手食指直立；右手拇、食指捏住左手食指尖，然后向下弯动。（可根据实际表示弯的状态）', '3');
INSERT INTO words_word VALUES ('70', '正方形', 'zhèngfāngxíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/6ca807423270835010649937550/gOKBvw4UuFUA.mp4', '（一）双手直立，掌心左右相对，向前一顿。\n（二）双手拇、食指成“ □”形。\n（三）双手拇、食指成“ └ ┘”形，置于脸颊两侧，上下交替动两下。', '3');
INSERT INTO words_word VALUES ('71', '方', 'fāng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/f6a1819b3270835010641308973/KMAAsFhsAEgA.mp4', '双手拇、食指搭成“ ⼞”形。', '3');
INSERT INTO words_word VALUES ('72', '长', 'zhǎng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/799ced073270835010639667079/IdeJHZ4u5m0A.mp4', '双手食指直立，指面相对，从中间向两侧拉开。（可根据实际表示长的状态）', '3');
INSERT INTO words_word VALUES ('73', '冰雹', 'bīngbáo', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/ac77ac993270835010640472169/RSTgg9ZiT3MA.mp4', '（一）双手五指成“ ㄈコ”形，虎口朝内，左右微动几下，表示结冰。\n（二）双手拇、食指捏成圆形，上下交替动几下，动作要快，如冰雹落下状。', '5');
INSERT INTO words_word VALUES ('74', '暴风骤雨', 'bàofēngzhòuyǔ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/b7a6229a3270835010640908418/gGe3AMKZSKgA.mp4', '（一）双手直立，掌心左右相对，五指微曲，左右来回扇动，动作迅猛，幅度要大，同时张口皱眉。\n（二）双手五指微曲，指尖朝下，在头前快速向下动几下，动作猛而急，表示雨大且迅猛，同时张口皱眉。', '5');
INSERT INTO words_word VALUES ('75', '降水量', 'jiàngshuǐliàng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/008429583270835010641783900/cGmtJhmoQn0A.mp4', '（一）双手五指微曲，指尖朝下，在头前快速向下动几下，表示雨点落下。\n（二）一手伸食指，指尖贴于下嘴唇。\n（三）左手食指直立；右手食指横贴在左手食指上，然后上下微动几下。', '5');
INSERT INTO words_word VALUES ('76', '炎热', 'yánrè', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/1d66db393270835010648840351/mfOdkRPH37QA.mp4', '（一）一手五指微曲，指尖朝上，上下动几下，面露烦躁的表情。\n（二）一手五指张开，手背向外，在额头上一抹，如流汗状。', '5');
INSERT INTO words_word VALUES ('77', '晴', 'qíng', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/ebd4b67c3270835010644943390/gfAWAblh0HwA.mp4', '一手五指并拢，掌心向外，置于头前，边向右移动边伸出拇指，表示天气睛朗，头同时微抬。', '5');
INSERT INTO words_word VALUES ('78', '天气预报', 'tiānqìyùbào', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/d06cb8463270835010647840977/pdjg0SdvKEEA.mp4', '（一）一手食指直立，在头一侧上方转动一圈。\n（二）一手打手指字母“ Q”的指式，指尖朝内，置于鼻孔处。\n（三）双手直立，手背前后相贴，左手在前不动，右手向后移动。\n（四）双手五指成“└ ┘”形，虎口贴于嘴边，向前方两侧移动两下。', '5');
INSERT INTO words_word VALUES ('79', '雾霾', 'wùmái', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/c0080a593270835010647133249/01TCvyxJ65sA.mp4', '（一）双手直立，掌心向外，五指张开，在眼前交替转动两下，同时眯眼，表示重雾迷目。\n（二）双手拇、食、中指相捏，指尖朝下，互捻几下，表示雾霾中的细微灰尘。', '5');
INSERT INTO words_word VALUES ('80', '雨', 'yǔ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/93ca39d93270835010650238915/v1npa7p56l0A.mp4', '双手五指微曲，指尖朝下，在头前快速向下动几下，表示雨点落下。（可根据实际决定动作的力度）', '5');
INSERT INTO words_word VALUES ('81', '阵雨', 'zhènyǔ', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/8f0e50b73270835010650029690/2kSjIoA2cAQA.mp4', '双手五指微曲，指尖朝下，在头前快速向下动几下，然后撮合，再快速向下动几下，表示雨下一会儿停一会儿。', '5');
INSERT INTO words_word VALUES ('82', '雾', 'wù', 'https://1500023236.vod-qcloud.com/6cbd4fd8vodcq1500023236/0ac175a33270835010648047578/ceAIDprJOqQA.mp4', '双手直立，掌心向外，五指张开，在眼前交替转动两下，同时眯眼，表示重雾迷目。', '5');
