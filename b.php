<?php

namespace App\Services;

use App\Wheel\TcbCloudStorage\CloudStorageFactory;

/**
 * Class PicassoServer
 * @package App\Services
 */
class PicassoServer
{
    private $obj;
    /**
     * @var PicassoClient
     */
    private $client;

    /**
     * PicassoServer constructor.
     */
    public function __construct()
    {
        $this->obj    = CloudStorageFactory::createCloudObj();
        $this->client = $this->obj->getClient();
    }

    /**
     * @return PicassoClient
     */
    public function getClient()
    {
        return $this->client;
    }

    public function __call($name, $arguments)
    {
        return call_user_func_array([$this->obj, $name], $arguments);
    }
}

