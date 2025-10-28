'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Mic, 
  File as FileIcon, 
  Link2, 
  HelpCircle, 
  BookOpen,
  Play,
  Pause,
  Volume2,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lesson } from '@/types';

interface ContentBlock {
  type: 'text' | 'video' | 'audio' | 'document' | 'embed';
  title: string;
  content: string;
  assetUrl?: string;
}

interface MultiContentData {
  primaryContent: ContentBlock;
  additionalContent: ContentBlock[];
}

interface LessonViewerProps {
  lesson: Lesson;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  isCompleted?: boolean;
  estimatedDuration?: number;
}

const contentTypeIcons = {
  text: <FileText className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  audio: <Mic className="h-5 w-5" />,
  document: <FileIcon className="h-5 w-5" />,
  embed: <Link2 className="h-5 w-5" />,
  quiz: <HelpCircle className="h-5 w-5" />,
  assignment: <BookOpen className="h-5 w-5" />,
};

function ContentRenderer({ content, type }: { content: ContentBlock | string; type: Lesson['type'] }) {
  if (typeof content === 'string') {
    // Simple lesson content
    return <SimpleContentRenderer content={content} type={type} />;
  }
  
  // Multi-content block
  return <MultiContentRenderer content={content} />;
}

function SimpleContentRenderer({ content, type }: { content: string; type: Lesson['type'] }) {
  switch (type) {
    case 'text':
      return (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    
    case 'video':
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {content.includes('youtube.com') || content.includes('youtu.be') ? (
            <iframe
              src={getYouTubeEmbedUrl(content)}
              title="Lesson Video"
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <video
              src={content}
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      );
    
    case 'audio':
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <audio controls className="w-full">
                  <source src={content} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    
    case 'document':
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Lesson Document</p>
                  <p className="text-sm text-muted-foreground">Click to download or view</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={content} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={content} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    
    case 'embed':
      return (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={content}
            title="Embedded Content"
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      );
    
    case 'quiz':
    case 'assignment':
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                {contentTypeIcons[type]}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {type === 'quiz' ? 'Interactive Quiz' : 'Assignment'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {type === 'quiz' 
                  ? 'Test your understanding with this interactive quiz.'
                  : 'Complete this assignment to practice what you\'ve learned.'
                }
              </p>
              <Button>
                {type === 'quiz' ? 'Start Quiz' : 'View Assignment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    
    default:
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Content type not supported</p>
          </CardContent>
        </Card>
      );
  }
}

function MultiContentRenderer({ content }: { content: ContentBlock }) {
  const { type, title, content: contentData, assetUrl } = content;
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {contentTypeIcons[type]}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SimpleContentRenderer 
          content={assetUrl || contentData} 
          type={type as Lesson['type']} 
        />
      </CardContent>
    </Card>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[7].length === 11 ? match[7] : false;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export function LessonViewer({ 
  lesson, 
  onComplete, 
  onProgress, 
  isCompleted = false,
  estimatedDuration 
}: LessonViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isMultiContent, setIsMultiContent] = useState(false);
  const [multiContentData, setMultiContentData] = useState<MultiContentData | null>(null);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    // Check if this is a multi-content lesson
    try {
      const parsed = JSON.parse(lesson.content);
      if (parsed.primaryContent && parsed.additionalContent) {
        setIsMultiContent(true);
        setMultiContentData(parsed);
      }
    } catch {
      setIsMultiContent(false);
    }
  }, [lesson.content]);

  const handleMarkComplete = () => {
    setProgress(100);
    onProgress?.(100);
    onComplete?.();
  };

  const allContentBlocks = multiContentData 
    ? [multiContentData.primaryContent, ...multiContentData.additionalContent]
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Lesson Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="flex items-center gap-1">
            {contentTypeIcons[lesson.type]}
            {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
          </Badge>
          {estimatedDuration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {estimatedDuration} min
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Completed
            </div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        
        {lesson.objectives && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.objectives }} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Bar */}
      {!isCompleted && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Content Area */}
      {isMultiContent && multiContentData ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">All Content</TabsTrigger>
            <TabsTrigger value="primary">
              {multiContentData.primaryContent.type.charAt(0).toUpperCase() + 
               multiContentData.primaryContent.type.slice(1)}
            </TabsTrigger>
            <TabsTrigger value="materials">
              Materials ({multiContentData.additionalContent.length})
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4 mt-6">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Primary Content</h3>
                  <MultiContentRenderer content={multiContentData.primaryContent} />
                </div>
                
                {multiContentData.additionalContent.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Materials</h3>
                    <div className="space-y-4">
                      {multiContentData.additionalContent.map((content, index) => (
                        <MultiContentRenderer key={index} content={content} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="primary" className="mt-6">
            <MultiContentRenderer content={multiContentData.primaryContent} />
          </TabsContent>
          
          <TabsContent value="materials" className="mt-6">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {multiContentData.additionalContent.map((content, index) => (
                  <MultiContentRenderer key={index} content={content} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Content Structure</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                      {contentTypeIcons[multiContentData.primaryContent.type]}
                      <span className="font-medium">{multiContentData.primaryContent.title}</span>
                      <Badge variant="secondary">Primary</Badge>
                    </div>
                    {multiContentData.additionalContent.map((content, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        {contentTypeIcons[content.type]}
                        <span>{content.title}</span>
                        <Badge variant="outline">Supplementary</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Study Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Start with the primary content to understand core concepts</li>
                    <li>• Review supplementary materials to deepen understanding</li>
                    <li>• Take notes while going through each content block</li>
                    <li>• Complete any interactive elements or assignments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Simple lesson content
        <Card>
          <CardContent className="p-6">
            <ContentRenderer content={lesson.content} type={lesson.type} />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center gap-4">
          {isMultiContent && (
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Multi-Content Lesson
            </Badge>
          )}
        </div>
        
        <div className="flex gap-3">
          {!isCompleted && (
            <Button onClick={handleMarkComplete}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          )}
          {isCompleted && (
            <Button variant="outline" disabled>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Completed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}