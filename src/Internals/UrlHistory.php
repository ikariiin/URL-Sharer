<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: lelouch
 * Date: 16/8/16
 * Time: 10:14 PM
 */

namespace Saitama\URLsharer\Internals;
use Aerys\Request;
use Aerys\Response;

class UrlHistory implements Routes {
    private $request;
    private $response;
    private $utility;

    /**
     * Routes constructor.
     * @param Request $request
     * @param Response $response
     * @param array $urlArgs (optional)
     * Should store the Request and Response objects for future use.
     */
    public function __construct(Request $request, Response $response, array $urlArgs = []) {
        $this->request = $request;
        $this->response = $response;
        $this->utility = new Utility;
    }

    /**
     * @return void
     * Do all the internal processing here.
     */
    public function process() {
        $this->utility->setJsonResponse($this->response);
        $this->response->end($this->utility->loadData("messages"));
    }
}