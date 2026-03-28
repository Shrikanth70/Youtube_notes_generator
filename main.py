# #Importing necessary libraries
# import os
# from dotenv import load_dotenv
# from crewai import Agent, Task, Crew
# from openai import OpenAI
# from utils import extract_video_id, get_transcript_text

# #Loading environment variables
# load_dotenv()


# #OpenRouterLLM class
# #This class is used to create a OpenRouterLLM object
# class OpenRouterLLM:
#     #__init__ method is used to initialize the OpenRouterLLM object
#     def __init__(self, model: str):
#         self.model = model
#         self.client = OpenAI(
#             api_key=os.getenv("OPENROUTER_API_KEY"),
#             base_url="https://openrouter.ai/api/v1"
#         )

#     #call method is used to call the OpenRouterLLM object
#     def call(self, prompt: str) -> str:
#         response = self.client.chat.completions.create(
#             model=self.model,
#             messages=[
#                 #system message is used to set the context of the conversation
#                 {
#                     "role": "system",
#                     "content": (
#                         "You are a highly skilled academic notes-maker. "
#                         "Convert transcript text into clear, well-structured, detailed markdown notes."
#                     )
#                 },
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=0.3,
#         )
#         return response.choices[0].message.content


# #main function
# def main():
#     #Getting the YouTube video URL from the user
#     video_url = input("Enter YouTube video URL: ").strip()

#     try:
#         #Extracting the video ID from the YouTube video URL
#         video_id = extract_video_id(video_url)
#         #Getting the transcript text from the YouTube video
#         transcript_text = get_transcript_text(video_id)

#         if not transcript_text:
#             #If the transcript is empty, raise an error
#             raise ValueError("Transcript was empty.")

#         model_name = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-super-120b-a12b:free")
#         #Creating a OpenRouterLLM object
#         llm = OpenRouterLLM(model=model_name)

#         #Creating a notes agent
#         notes_agent = Agent(
#             role="YouTube Notes Maker",
#             goal="Create detailed, well-structured markdown notes from YouTube transcripts.",
#             backstory=(
#                 "You are an expert educational content processor who turns long spoken explanations "
#                 "into structured study notes."
#             ),
#             verbose=True,
#             #allow_delegation is used to allow the agent to delegate tasks to other agents
#             allow_delegation=False,
#             llm=llm,
#         )

#         #Creating a task description
#         task_description = f"""
# You are given a YouTube transcript.

# Transcript:
# {transcript_text}

# Create comprehensive markdown notes using this exact structure:

# # Title
# A concise title based on the topic.

# ## Overview
# 2-4 paragraph explanation of what the video is about.

# ## Key Concepts
# - Detailed bullet points
# - Explain each important concept clearly

# ## Step-by-Step Explanation
# Break the content into logical sections with headings and subheadings.

# ## Important Examples
# List and explain examples mentioned or implied.

# ## Practical Takeaways
# - Actionable points
# - Real-world usage
# - Important insights

# ## Quick Revision
# - Short summary bullets for fast revision

# ## Glossary
# Define important technical words simply.

# Rules:
# - Output must be valid markdown
# - Keep it detailed but clean
# - Remove filler/repetition from spoken language
# - Preserve meaning accurately
# - Do not invent facts not present in the transcript
# """

#         #Creating a task
#         notes_task = Task(
#             description=task_description,
#             expected_output="Detailed and properly structured markdown notes from the transcript.",
#             agent=notes_agent,
#         )

#         #Creating a crew
#         crew = Crew(
#             agents=[notes_agent],
#             tasks=[notes_task],
#             verbose=True,
#         )

#         #Kicking off the crew
#         result = crew.kickoff()

#         #Converting the result to a string
#         final_notes = str(result)

#         #Writing the final notes to a file
#         with open("generated_notes.md", "w", encoding="utf-8") as f:
#             f.write(final_notes)

#         #Printing the final notes
#         print("\nNotes generated successfully!")
#         print("Saved as: generated_notes.md\n")
#         print(final_notes)

#     #If an error occurs, print the error
#     except Exception as e:
#         print(f"Error: {e}")


# #Main function
# if __name__ == "__main__":
#     #Calling the main function  
#     main()

import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from utils import extract_video_id, get_transcript_text

load_dotenv()


def main():
    video_url = input("Enter YouTube video URL: ").strip()

    try:
        # Step 1: Extract video ID
        video_id = extract_video_id(video_url)

        # Step 2: Fetch transcript
        transcript_text = get_transcript_text(video_id)

        if not transcript_text:
            raise ValueError("Transcript is empty.")

        # Step 3: Define agent
        notes_agent = Agent(
            role="YouTube Notes Maker",
            goal="Create detailed, well-structured markdown notes from YouTube transcripts.",
            backstory=(
                "You are an expert educational content processor who turns long spoken explanations "
                "into structured study notes."
            ),
            llm="openrouter/nvidia/nemotron-3-super-120b-a12b:free",
            verbose=True,
            allow_delegation=False,
        )

        # Step 4: Define task
        notes_task = Task(
            description=f"""
You are given a YouTube transcript.

Transcript:
{transcript_text}

Create comprehensive markdown notes using this exact structure:

# Title
A concise title based on the topic.

## Overview
2-4 paragraph explanation of what the video is about.

## Key Concepts
- Detailed bullet points
- Explain each important concept clearly

## Step-by-Step Explanation
Break the content into logical sections with headings and subheadings.

## Important Examples
List and explain examples mentioned or implied.

## Practical Takeaways
- Actionable points
- Real-world usage
- Important insights

## Quick Revision
- Short summary bullets for fast revision

## Glossary
Define important technical words simply.

Rules:
- Output must be valid markdown
- Keep it detailed but clean
- Remove filler/repetition from spoken language
- Preserve meaning accurately
- Do not invent facts not present in the transcript
""",
            expected_output="Detailed, structured markdown notes.",
            agent=notes_agent,
        )

        # Step 5: Create crew
        crew = Crew(
            agents=[notes_agent],
            tasks=[notes_task],
            verbose=True,
        )

        # Step 6: Run
        result = crew.kickoff()
        final_notes = str(result)

        # Step 7: Save result
        with open("generated_notes.md", "w", encoding="utf-8") as f:
            f.write(final_notes)

        print("\nNotes generated successfully!")
        print("Saved as: generated_notes.md")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()