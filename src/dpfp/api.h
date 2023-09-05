/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019-2023 Toha <tohenk@yahoo.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

#if !defined(DPFP_API_H_INCLUDED)
#define DPFP_API_H_INCLUDED

#include <assert.h>
#include <queue>
#include <stdlib.h>
#ifdef __linux__
#include <limits.h>
#include <string.h>
#include <unistd.h>
#endif
#include <node_api.h>

#include "fp.h"
#ifdef _WIN32
#include "msg.h"
#endif

typedef enum {
    FP_ACQUIRE_READER,
    FP_ACQUIRE_CAPTURE,
    FP_ACQUIRE_ENROLL,
} FP_ACQUIRE_OP;

typedef struct {
    FP_ACQUIRE_OP op;
    void* data;
    unsigned int len;
} FP_ACQUIRE_QUEUE;

typedef struct {
    string status;
    void* data;
    unsigned int len;
} FP_ACQUIRE_DATA;

typedef enum {
    FP_ACQUIRE_FLAG_CAPTURE = 0x00,
    FP_ACQUIRE_FLAG_RAW = 0x01,
    FP_ACQUIRE_FLAG_ENROLL = 0x02,
} FP_ACQUIRE_FLAGS;

typedef struct {
    bool init;
    bool exit;
#ifdef _WIN32
    MsgWin* msg;
    LONG_PTR parent;
#endif
    DPFPReader* reader;
    struct {
        napi_async_work work;
    } worker;
    struct {
        bool stopped;
        napi_async_work work;
        napi_threadsafe_function fn;
        queue<FP_ACQUIRE_QUEUE>* q;
        napi_async_work swork;
        napi_threadsafe_function sfn;
    } acquire;
    struct {
        napi_async_work work;
        napi_deferred deferred;
        bool matched;
        unsigned char* feature;
        unsigned int featurelen;
        unsigned char* fmd;
        unsigned int fmdlen;
    } compare;
    struct {
        napi_async_work work;
        napi_deferred deferred;
        int matched;
        unsigned char* feature;
        unsigned int featurelen;
        unsigned char** fmds;
        unsigned int* fmdlens;
        unsigned int fmdcnt;
    } identify;
} FP_API_DATA;

bool fp_get_buffer(napi_env env, napi_value buff, unsigned char** data, unsigned int* len);

#endif // !defined(DPFP_API_H_INCLUDED)
