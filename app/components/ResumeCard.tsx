import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import { Link } from "react-router";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadResume = async () => {
            try {
                const blob = await fs.read(imagePath);
                if(!mounted) return;

                if(!blob) {
                    console.warn(`Failed to read image at path: ${imagePath}`);
                    setImageError(true);
                    return;
                }
                let url = URL.createObjectURL(blob);
                setResumeUrl(url);
            } catch (error) {
                console.error('Error loading resume image:', error);
                if(mounted) setImageError(true);
            }
        }

        loadResume();

        return () => {
            mounted = false;
            if (resumeUrl) {
                URL.revokeObjectURL(resumeUrl);
            }
        };
    }, [imagePath, fs]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            <div className="gradient-border animate-in fade-in duration-1000">
                <div className="w-full h-full">
                    {resumeUrl && !imageError ? (
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-[350px] max-sm:h-[200px] bg-gray-100 flex items-center justify-center">
                            <div className="text-center p-4">
                                <img src="/icons/warning.svg" alt="error" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-gray-500 text-sm">Preview unavailable</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
export default ResumeCard