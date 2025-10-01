import React, { useState, type FormEvent } from 'react';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar';
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { AIResponseFormat, prepareInstructions } from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        if (file) {
            setFile(file);
            console.log('File selected:', file?.name);
        }
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        try {
            setIsProcessing(true);
            setStatusMessage("Uploading the File..");
            const uploadedFile = await fs.upload([file]);

            if (!uploadedFile) {
                setStatusMessage("Error: Uploading PDF failed");
                setIsProcessing(false);
                return;
            }

            setStatusMessage("Converting to Image...")
            const imageResult = await convertPdfToImage(file);

            if (!imageResult.file) {
                setStatusMessage(imageResult.error || "Error: Failed to convert PDF file to image");
                setIsProcessing(false);
                return;
            }

            setStatusMessage("Uploading image..");
            const uploadedImage = await fs.upload([imageResult.file]);

            if (!uploadedImage) {
                setStatusMessage("Error: Uploading Image failed");
                setIsProcessing(false);
                return;
            }

            setStatusMessage("Preparing data...");
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName: companyName,
                jobTitle: jobTitle,
                jobDescription: jobDescription,
                feedback: ''
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusMessage("Analyzing ...");
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );

            if (!feedback) {
                setStatusMessage("Error: Failed to analyze resume");
                setIsProcessing(false);
                return;
            }

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            try {
                data.feedback = JSON.parse(feedbackText);
            } catch (parseError) {
                console.error("Failed to parse feedback:", parseError);
                setStatusMessage("Error: Invalid feedback format");
                setIsProcessing(false);
                return;
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusMessage("Analysis complete, redirecting...");
            console.log(data);
            navigate(`/resume/${uuid}`);

        } catch (error) {
            console.error("Analysis error:", error);
            setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
            setIsProcessing(false);
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        if (!form) return;

        const formData = new FormData(form);
        const companyName = formData.get('companyName') as string;
        const jobTitle = formData.get('jobTitle') as string;
        const jobDescription = formData.get('jobDescription') as string;

        console.log(companyName + ">>" + jobTitle + ">>" + jobDescription);

        if (!file) {
            alert('Please upload a resume file');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main>
            <Navbar />

            <section className="main-section">
                <div className="page-heading ">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusMessage}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" alt="scan" />
                        </>
                    ) : (
                        <h2>Upload your resume for an ATS Score and improvement tips</h2>
                    )}

                    {!isProcessing && (
                        <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" id="company-name" placeholder='Company Name' name="companyName" className='input-field' required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" id="job-title" placeholder='Job Title' name="jobTitle" className='input-field' required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} id="job-description" placeholder='Job Description' name="jobDescription" className='input-field' required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                                {file && (
                                    <p className="text-sm text-green-600 mt-2">
                                        ✓ {file.name} selected
                                    </p>
                                )}
                            </div>

                            <button type="submit" className='primary-button' disabled={!file}>
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;