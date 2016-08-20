<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: lelouch
 * Date: 16/8/16
 * Time: 10:22 PM
 */

namespace Saitama\URLsharer\Internals;
use Aerys\Response;
use Saitama\URLsharer\Exceptions\FileNotFound;

class Utility {
    /**
     * @param Response $response
     */
    public function setJsonResponse(Response $response) {
        $response->setHeader("Content-Type", "application/json");
    }

    /**
     * @param string $fileName
     * @param bool $appendJsonExt
     * @return string
     * @throws FileNotFound
     */
    public function loadData(string $fileName, bool $appendJsonExt = true) {
        $fileName = ($appendJsonExt) ? __DIR__ . "/../Data/" . $fileName . ".json" : $fileName;
        $content = file_get_contents($fileName);
        if(!$content) {
            throw new FileNotFound;
        }

        var_dump($content);

        return $content;
    }
}