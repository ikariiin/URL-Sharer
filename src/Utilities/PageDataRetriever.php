<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: lelouch
 * Date: 11/8/16
 * Time: 10:51 PM
 */

namespace Saitama\URLsharer\Utilities;
use Saitama\URLsharer\Exceptions\TitleNotFoundException;

class PageDataRetriever {
    private $pageContent;

    /**
     * @var \DOMDocument
     */
    private $domDocument;

    public function __construct(string $pageContent) {
        $this->pageContent = $pageContent;

        return $this;
    }

    public function process(){
        $domDocument = new \DOMDocument();
        @$domDocument->loadHTML($this->pageContent);
        $this->domDocument = $domDocument;
    }

    public function getTitle(): string {
        if(!$this->domDocument instanceof \DOMDocument)
            throw new \RuntimeException();

        $temporary = $this->domDocument->getElementsByTagName("title");
        if($temporary->length > 0) {
            return $temporary->item(0)->textContent;
        } else {
            throw new TitleNotFoundException();
        }
    }
}