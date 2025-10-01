import React, {useCallback} from 'react';
import {useDropzone} from "react-dropzone";
import { formatSize } from '~/lib/utils';

interface FileUploaderProps{
    onFileSelect?: (file:File|null) => void;
}

const FileUploader = ({onFileSelect}:FileUploaderProps) => {

    const onDrop = useCallback((acceptedFiles:File[]) => {
        const file = acceptedFiles[0]|| null;
        onFileSelect?.(file);

    }, [onFileSelect]);

    const maxFileSize = 20*1024*1024;
    const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({onDrop, multiple:false, maxSize:maxFileSize, accept:{'application/pdf':['.pdf']}});

    const file = acceptedFiles[0]|| null;

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="space-y-4 cursor-pointer">
                    {file ?(
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt='pdf' className="size-10"/>

                            <div className='flex items-center space-x-3'>
                                <div>
                                    <p className="text-sm text-gray-700 font-medium truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button  className="p-2 cursor-pointer" onClick={(e) =>{ onFileSelect?.(null)}}>
                                <img src="/icons/cross.svg" alt='cross' className="w-4 h-4" />
                            </button>
                        </div>
                    ):(
                        <>
                            <div className='mx-auto mb-2 w-16 h-16 flex flex-col justify-center items-center border-2 border-dashed rounded-lg'>
                                <img src="/icons/info.svg" alt="upload" className='size-20'/>
                            </div>
                            <p className="text-lg text-grey-500">
                            <span className="font-semibold">
                                Click to upload
                            </span> or drag and drop
                            </p>
                            <p className="text-lg text-grey-500">
                                PDF (max {formatSize(maxFileSize)})
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;