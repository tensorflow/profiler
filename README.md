# TensorFlow Profiler
The profiler includes a suite of tools. These tools help you understand, debug and optimize TensorFlow programs to run on CPUs, GPUs and TPUs.

## Demo
First time user? Come and check out this [Colab Demo](https://www.tensorflow.org/tensorboard/tensorboard_profiling_keras).

## Prerequisites
* TensorFlow >= 2.2.0rc0 
* TensorBoard >= 2.2.0 (or tb-nightly)
* tensorboard-plugin-profile >= 2.2.0rc0

To profile on the GPU, the following NVIDIA software must be installed on your system:
1. NVIDIA GPU drivers and CUDA Toolkit:
    *   CUDA 10.2 requires 440.33 (Linux) / 441.22 (Windows) and higher. (recommended)
    *   CUDA 10.1 requires 418.x and higher.

2. Ensure that CUPTI exists on the path.

    *   Run `ldconfig -p | grep libcupti`
    *   If you don't have CUPTI on the path, run:

        ```shell
        export LD_LIBRARY_PATH=/usr/local/cuda/extras/CUPTI/lib64:$LD_LIBRARY_PATH
        ```

    *   Run the `ldconfig` command above again to verify that the CUPTI library
        is found

To profile multi-worker GPU configurations, profile individual workers
independently.

To profile cloud TPUs, you must have access to Google Cloud TPUs.

## Quick Start
Install the profiler by downloading and running the `install_and_run.py` script from this directory.
```
$ git clone https://github.com/tensorflow/profiler.git profiler
$ mkdir profile_env
$ python3 profiler/install_and_run.py --envdir=profile_env --logdir=profiler/demo
```
Go to `localhost:6006/#profile` of your browser, you should now see the demo overview page show up.
![Overview Page](docs/images/overview_page.png)
Congratulations! You're now ready to capture a profile.

## Next Steps
* GPU Profiling Guide:  https://tensorflow.org/guide/profiler
* Cloud TPU Profiling Guide: https://cloud.google.com/tpu/docs/cloud-tpu-tools
* Colab Tutorial: https://www.tensorflow.org/tensorboard/tensorboard_profiling_keras

## Known Issues
Multi-GPU Profiling does not work with CUDA 10.1. While CUDA 10.2 is not officially supported by TF, profiling on CUDA 10.2 is known to work on some configurations.
