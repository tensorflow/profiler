# Profile multiple GPUs with TensorFlow 2.2:

## Software requirements

NVIDIA® `CUDA 10.2` must be installed on your system:

* [NVIDIA® GPU drivers](https://www.nvidia.com/drivers) —`CUDA 12.x` requires `525.60.13 (Linux) / 527.41 (Windows)` and higher.
* [CUDA® Toolkit 12.5](https://developer.nvidia.com/cuda-toolkit-archive)
* CUPTI ships with the CUDA Toolkit.

## Linux setup

1. Install the [CUDA® Toolkit 10.2](https://developer.nvidia.com/cuda-downloads), select the target platform.
   Here's the an example to install cuda 12.5 on Ubuntu 20.04 with nvidia driver and cupti included.

   ```shell
   $ wget https://developer.download.nvidia.com/compute/cuda/12.5.0/local_installers/cuda_12.5.0_555.42.02_linux.run
   $ sudo sh cuda_12.5.0_555.42.02_linux.run  # Select NVIDIA driver and CUPTI.
   ```

2. Ensure CUPTI exists on the path:
   ```shell
   $ /sbin/ldconfig -N -v $(sed 's/:/ /g' <<< $LD_LIBRARY_PATH) | grep libcupti
   ```
   You should see a string like
   `libcupti.so.12.5 -> libcupti.so.12.5.75`

   If you don't have CUPTI on the path, prepend its installation directory to the $LD_LIBRARY_PATH environmental variable:

   ```shell
   $ export LD_LIBRARY_PATH=/usr/local/cuda/extras/CUPTI/lib64:$LD_LIBRARY_PATH
   ```
   Run the ldconfig command above again to verify that the `CUPTI 12.5` library is found.

3. Make symbolic link to `libcudart.so.12.5` and `libcupti.so.12.5`.
   TensorFlow 2.18 looks for those strings unless you build your own pip package with [TF_CUDA_VERSION=12.5](https://raw.githubusercontent.com/tensorflow/tensorflow/6f43bd412b4aa6c2b23eeb7f4f71b557f14dc8a7/tensorflow/tools/ci_build/linux/rocm/rocm_py38_pip.sh#L25).

   ```shell
   $ sudo ln -s /usr/local/cuda/lib64/libcudart.so.12.5 /usr/local/cuda/lib64/libcudart.so.12.5
   $ sudo ln -s /usr/local/cuda/extras/CUPTI/lib64/libcupti.so.12.5 /usr/local/cuda/extras/CUPTI/lib64/libcupti.so.12.5
   ```
4. Run the model again and look for `Successfully opened dynamic library libcupti.so.12.5` in the logs. Your setup is now complete.
