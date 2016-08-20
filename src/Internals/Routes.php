<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: lelouch
 * Date: 16/8/16
 * Time: 9:59 PM
 */

namespace Saitama\URLsharer\Internals;
use Aerys\Response;
use Aerys\Request;

interface Routes {
    /**
     * Routes constructor.
     * @param Request $request
     * @param Response $response
     * @param array $urlArgs (optional)
     * Should store the Request and Response objects for future use.
     */
    public function __construct(Request $request, Response $response, array $urlArgs = []);

    /**
     * @return void
     * Do all the internal processing here.
     */
    public function process();
}