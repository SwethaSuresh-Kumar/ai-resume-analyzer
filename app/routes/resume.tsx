import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import Details from "~/components/Details";
import ATS from "~/components/ATS";

export const meta = () => ([
    { title: 'Ai-Powered Resume Analyzer | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const navigate = useNavigate();

    // useEffect(() => {
    //     if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    // }, [isLoading])

useEffect(() => {
    let mounted = true;
    let localResumeUrl = '';
    let localImageUrl = '';

    const loadResume = async () => {
        try {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) {
                if(mounted) setLoadError('Resume not found');
                return;
            }

            const data = JSON.parse(resume);
            console.log(data);

            // Load resume PDF
            try {
                const resumeBlob = await fs.read(data.resumePath);
                if(!mounted) return;

                if(resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    localResumeUrl = URL.createObjectURL(pdfBlob);
                    setResumeUrl(localResumeUrl);
                } else {
                    console.warn('Failed to load PDF');
                }
            } catch (error) {
                console.error('Error loading PDF:', error);
            }

            // Load image preview
            try {
                const imageBlob = await fs.read(data.imagePath);
                if(!mounted) return;

                if(imageBlob) {
                    const imgBlob = new Blob([imageBlob], { type: 'image/png' });
                    localImageUrl = URL.createObjectURL(imgBlob);
                    setImageUrl(localImageUrl);
                } else {
                    console.warn('Failed to load image preview');
                }
            } catch (error) {
                console.error('Error loading image:', error);
            }

            if(mounted) {
                setFeedback(data.feedback);
                console.log({resumeUrl: localResumeUrl, imageUrl: localImageUrl, feedback: data.feedback });
            }
        } catch (error) {
            console.error('Error loading resume:', error);
            if(mounted) setLoadError('Failed to load resume data');
        }
    }

    loadResume();

    return () => {
        mounted = false;
        if(localResumeUrl) URL.revokeObjectURL(localResumeUrl);
        if(localImageUrl) URL.revokeObjectURL(localImageUrl);
    };
}, [id, fs, kv]);


    if(loadError) {
        return (
            <main className="!pt-0">
                <nav className="resume-nav">
                    <Link to="/" className="back-button">
                        <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                        <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                    </Link>
                </nav>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <img src="/icons/warning.svg" alt="error" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Error Loading Resume</h2>
                        <p className="text-gray-500">{loadError}</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl ? (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                    alt="resume preview"
                                />
                            </a>
                        </div>
                    ) : (
                        <div className="gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center p-8 rounded-2xl">
                                <div className="text-center">
                                    <img src="/icons/info.svg" alt="loading" className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                                    <p className="text-gray-500">Loading preview...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" alt="analyzing" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume