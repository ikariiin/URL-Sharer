<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: lelouch
 * Date: 11/8/16
 * Time: 5:22 PM
 */

use Saitama\URLsharer\Exceptions\TitleNotFoundException;

file_put_contents(__DIR__ . "/Data/urls.json", "[]");
file_put_contents(__DIR__ . "/Data/messages.json", "[]");

include_once __DIR__ . "/../vendor/autoload.php";
include_once __DIR__ . "/autoload.php";

$router = Aerys\router()
    ->get("/info/{url}", function (\Aerys\Request $request, \Aerys\Response $response, array $urlArgs) {
        $url = rawurldecode($urlArgs["url"]);
        $response->setHeader("Content-Type", "application/json");

        $content = file_get_contents($url);

        $jsonOptions = JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES;
        if($content) {
            $pageDataRetriever = new \Saitama\URLsharer\Internals\PageDataRetriever($content);

            $parsedUrl = parse_url($url);
            $port = isset($parsedUrl["port"]) ? $parsedUrl : 80;
            $favicon = $parsedUrl["scheme"] . "://" . $parsedUrl["host"] . ":" . $port . "/favicon.ico";


            try {
                $pageDataRetriever->process();
                $title = $pageDataRetriever->getTitle();
                $response->end(json_encode([
                    "title" => $title,
                    "faviconUri" => $favicon
                ], $jsonOptions));
            } catch (TitleNotFoundException $ex) {
                $response->end(json_encode([
                    "title" => "Title Not Found",
                    "faviconUri" => $favicon
                ], $jsonOptions));
            } catch (RuntimeException $ex) {
                $response->end(json_encode([
                    "error" => true,
                    "description" => "Application Error"
                ], $jsonOptions));
            }
        } else {
            $response->end(json_encode([
                "error" => true,
                "description" => "Url is malformed / the url resource doesn't exit / the server is facing problems"
            ], $jsonOptions));
        }
    })
    ->get("/urlsHistory", function (\Aerys\Request $request, \Aerys\Response $response) {
        $history = file_get_contents(__DIR__ . "/Data/urls.json");
        $response->setHeader("Content-Type", "application/json")
            ->end($history);
    })
    ->get("/chatHistory", function (\Aerys\Request $request, \Aerys\Response $response) {
        $history = file_get_contents(__DIR__ . "/Data/messages.json");
        $response->setHeader("Content-Type", "application/json")
            ->end($history);
    });

$websocket = Aerys\websocket(new class implements Aerys\Websocket {
    /**
     * @var Aerys\Websocket\Endpoint
     */
    private $endpoint;
    private $clientIds = [];

    public function onStart(\Aerys\Websocket\Endpoint $endpoint) {
        $this->endpoint = $endpoint;
    }

    public function onHandshake(\Aerys\Request $request, \Aerys\Response $response) {
        // TODO: Implement onHandshake() method.
    }

    public function onOpen(int $clientId, $handshakeData) {
        $this->clientIds[] = $clientId;
    }

    public function onData(int $clientId, \Aerys\Websocket\Message $msg) {
        $message = yield $msg;
        $message = json_decode($message, true);

        $urls = json_decode(file_get_contents(__DIR__ . "/Data/urls.json"), true);

        $urls[] = $message;

        file_put_contents(__DIR__ . "/Data/urls.json", json_encode($urls, JSON_PRETTY_PRINT));

        $clientIds = $this->clientIds;
        $key = array_search($clientId, $clientIds);
        unset($clientIds[$key]);

        $this->endpoint->send($clientIds, json_encode($message));
    }
    
    public function onClose(int $clientId, int $code, string $reason) {
        // TODO: Implement onClose() method.
    }
    
    public function onStop() {
        // TODO: Implement onStop() method.
    }
});

$chatWebsocket = Aerys\websocket(new class implements Aerys\Websocket {
    /**
     * @var Aerys\Websocket\Endpoint
     */
    private $endpoint;
    private $clientIds = [];

    public function onStart(\Aerys\Websocket\Endpoint $endpoint) {
        $this->endpoint = $endpoint;
    }

    public function onHandshake(\Aerys\Request $request, \Aerys\Response $response) {
        // TODO: Implement onHandshake() method.
    }

    public function onOpen(int $clientId, $handshakeData) {
        $this->clientIds[] = $clientId;
    }

    public function onData(int $clientId, \Aerys\Websocket\Message $msg) {
        $message = yield $msg;
        $message = json_decode($message, true);

        $urls = json_decode(file_get_contents(__DIR__ . "/Data/messages.json"), true);

        $urls[] = $message;

        file_put_contents(__DIR__ . "/Data/messages.json", json_encode($urls, JSON_PRETTY_PRINT));

        $clientIds = $this->clientIds;
        $key = array_search($clientId, $clientIds);
        unset($clientIds[$key]);

        $this->endpoint->send($clientIds, json_encode($message));
    }

    public function onClose(int $clientId, int $code, string $reason) {
        // TODO: Implement onClose() method.
    }

    public function onStop() {
        // TODO: Implement onStop() method.
    }
});

$router->get("/websocketEndpoint", $websocket);
$router->get("/chatWebsocket", $chatWebsocket);

(new Aerys\Host())
    ->expose("*", 1337)
    ->use($router)
    ->use(\Aerys\root(__DIR__ . "/../public"));