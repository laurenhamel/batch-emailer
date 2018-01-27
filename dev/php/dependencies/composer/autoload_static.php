<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit5ea7cd9f60d26308ade400eeb9eb9571
{
    public static $prefixLengthsPsr4 = array (
        'P' => 
        array (
            'PHPMailer\\PHPMailer\\' => 20,
        ),
        'D' => 
        array (
            'Dotenv\\' => 7,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'PHPMailer\\PHPMailer\\' => 
        array (
            0 => __DIR__ . '/..' . '/phpmailer/phpmailer/src',
        ),
        'Dotenv\\' => 
        array (
            0 => __DIR__ . '/..' . '/vlucas/phpdotenv/src',
        ),
    );

    public static $prefixesPsr0 = array (
        'M' => 
        array (
            'Mustache' => 
            array (
                0 => __DIR__ . '/..' . '/mustache/mustache/src',
            ),
        ),
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit5ea7cd9f60d26308ade400eeb9eb9571::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit5ea7cd9f60d26308ade400eeb9eb9571::$prefixDirsPsr4;
            $loader->prefixesPsr0 = ComposerStaticInit5ea7cd9f60d26308ade400eeb9eb9571::$prefixesPsr0;

        }, null, ClassLoader::class);
    }
}
