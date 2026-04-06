# Using Codex to Generate a Storyboard From a Script

This guide explains a practical beginner workflow for using Codex and the OpenAI API to turn a hypothetical stylized 3D animated script into a storyboard.

One important note up front: instead of asking directly for a "Pixar style" result, it is better to describe the qualities you want, such as stylized family-friendly 3D animation, expressive faces, cinematic lighting, soft materials, appealing proportions, emotional clarity, and storybook-inspired color design.

## 1. Get Set Up

### Access Codex

Codex is available through ChatGPT plans. As of March 31, 2026, ChatGPT Plus is listed at $20/month and includes access to Codex. OpenAI has also said Codex is temporarily included with Free and Go plans, but with lower limits, so a paid plan is helpful for a smoother workflow.

Useful links:

- [ChatGPT pricing](https://openai.com/chatgpt/pricing/)
- [Codex in ChatGPT FAQ](https://help.openai.com/en/articles/11369540-codex-in-chatgpt-faq)

### Get an OpenAI API key

If you want Codex to automate image generation in batches, you will also want an OpenAI API key through the OpenAI Platform.

Steps:

1. Create or sign in to your OpenAI Platform account.
2. Add billing to your API account if needed.
3. Create an API key in the Platform dashboard.
4. Store it in your shell environment as `OPENAI_API_KEY`.

Example:

```bash
export OPENAI_API_KEY="your_api_key_here"
```

Useful links:

- [API authentication](https://platform.openai.com/docs/api-reference/authentication?api-mode=responses)
- [Quickstart: set up your API key](https://platform.openai.com/docs/quickstart/step-2-set-up-your-api-key)

### Be aware of separate billing

ChatGPT/Codex access and API usage are separate:

- ChatGPT Plus covers using Codex in ChatGPT/Codex.
- API image generation is billed separately through the OpenAI API account.

### Check image model access

OpenAI's image generation documentation notes that access to GPT Image models may require organization verification.

Useful links:

- [Image generation guide](https://platform.openai.com/docs/guides/image-generation?lang=curl)
- [GPT Image 1.5 model page](https://platform.openai.com/docs/models/gpt-image-1.5)

## 2. Create a Visual Bible Before Making the Storyboard

Before generating storyboard panels, use Codex to help define the visual world.

Ask Codex to read the script and extract:

- main characters
- approximate age and silhouette
- wardrobe and props
- key environments
- emotional tone
- recurring visual motifs
- likely camera language

Then ask Codex to produce a reusable visual bible that includes:

- overall art direction
- lighting rules
- color palette
- camera/lens feel
- level of detail
- composition guidelines
- materials and texture language
- negative prompt guidance

This visual bible becomes the shared style anchor for the whole storyboard.

## 3. Build Character Model Prompts

For each main character, ask Codex to write a consistent character description that can be reused in image prompts.

Each character prompt should include:

- age and build
- face shape
- hair
- costume
- color palette
- personality cues
- default expression tendencies
- pose or movement language

The goal is not just to describe the character once, but to create a prompt that produces the same character repeatedly.

## 4. Generate Sample Images Until the Style Feels Consistent

Do not jump straight into generating every storyboard panel.

First, use Codex and the image model to create a look-development pass:

- close-up character portraits
- full-body character images
- multiple facial expressions
- environment establishing shots
- images of two or more characters interacting

Then review the outputs carefully:

- Does the same character look like the same person each time?
- Does the color palette feel right?
- Does the world feel emotionally correct for the script?
- Does the style feel coherent from image to image?

Ask Codex to revise the master style prompt based on your feedback. Repeat this process until the output is consistently close to what you want.

This step saves time and money. It is much cheaper to refine the style prompt with 10 to 20 test images than to regenerate 100 storyboard panels later.

## 5. Ask Codex to Chunk the Script Into Scenes and Panels

Once the style is stable, ask Codex to break the script into production-ready storyboard chunks.

First, have it divide the script into natural scenes. Then have it divide each scene into beats. Then have it divide each beat into storyboard panels.

For each panel, ask Codex to capture:

- scene number
- panel number
- location
- time of day
- characters in frame
- camera angle or shot type
- action
- emotional beat
- important prop or set detail
- short dialogue line if needed
- continuity notes from the previous panel

This can be produced as a table or JSON structure. The important thing is that each panel becomes a clear, imageable unit.

## 6. Generate One Image Per Panel

At this point, Codex can help iterate through the panel list and generate images one by one.

Each panel image prompt should combine:

- the master style prompt
- the relevant character model prompt(s)
- the environment notes
- the panel-specific shot description

Use predictable filenames such as:

- `scene_01_panel_01.png`
- `scene_01_panel_02.png`
- `scene_02_panel_01.png`

Generate in batches rather than all at once. A good beginner workflow is to generate 10 to 20 panels at a time, review them, then continue.

## 7. Review the Sequence, Not Just Single Images

A storyboard succeeds or fails as a sequence.

After each batch, ask Codex to help review for:

- character drift
- costume inconsistency
- prop continuity issues
- environment layout changes
- weak staging
- repetitive camera angles
- missing emotional transitions

Then regenerate only the weak panels instead of redoing the entire set.

## 8. Suggested Prompting Workflow in Codex

Codex is most useful here in three roles:

### Prompt engineer

Use Codex to write and refine:

- the master visual style prompt
- character consistency prompts
- environment prompts
- panel-level image prompts

### Script analyst

Use Codex to:

- summarize the script
- identify scene changes
- split scenes into beats
- turn beats into storyboard panels

### Production assistant

Use Codex to:

- organize panel metadata
- generate prompts for each panel
- call the image API in batches
- save files with a consistent naming scheme

A very useful instruction to give Codex is:

> Do not generate final panel prompts until you first produce a reusable visual bible and a character consistency guide.

## 9. Approximate Cost

As of March 31, 2026, the GPT Image 1.5 model page lists the following image-generation pricing for 1024x1024 images:

- Low: $0.009 per image
- Medium: $0.034 per image
- High: $0.133 per image

Approximate image-only cost at 1024x1024:

| Number of images | Low | Medium | High |
| --- | ---: | ---: | ---: |
| 50 | $0.45 | $1.70 | $6.65 |
| 100 | $0.90 | $3.40 | $13.30 |
| 200 | $1.80 | $6.80 | $26.60 |

For taller frames such as 1024x1536, the current listed medium price is $0.05 per image, so 100 images would be about $5.00.

For storyboarding, medium quality is often a good default because it keeps cost low while preserving enough clarity to judge staging and continuity.

Useful link:

- [GPT Image 1.5 pricing](https://platform.openai.com/docs/models/gpt-image-1.5)

## 10. Example Budget Scenarios

A realistic first project might include:

- 10 to 20 style-development test images
- 20 to 40 character and environment consistency images
- 40 to 100 storyboard panels

That puts many first-run projects in the range of 70 to 160 generated images total.

At medium quality and 1024x1024:

- 70 images: about $2.38
- 100 images: about $3.40
- 160 images: about $5.44

Prompt-token costs for the text side of the workflow are usually much smaller than the image costs, often just cents to a few dollars depending on how much iteration you do.

## 11. Recommended First Run

For someone who has not used Codex before, this is a strong first-pass workflow:

1. Use ChatGPT Plus if you want more comfortable Codex limits and a smoother experience.
2. Set up an OpenAI API key for image generation.
3. Ask Codex to analyze the script and create a visual bible.
4. Ask Codex to create character model prompts.
5. Generate 10 to 20 test images until the prompt feels stable.
6. Ask Codex to split the script into scenes, beats, and storyboard panels.
7. Generate storyboard images in batches of 10 to 20 panels.
8. Review sequence continuity after each batch.
9. Regenerate only the weak or inconsistent panels.

## 12. Summary

The key to using Codex well for storyboarding is to treat the process as a pipeline:

1. establish the visual language
2. tune the prompt until it is consistent
3. chunk the script into scene and panel units
4. generate one image per panel
5. review continuity and iterate selectively

That approach is much more reliable than trying to generate a full storyboard in one pass.

---

## Sources

- [ChatGPT pricing](https://openai.com/chatgpt/pricing/)
- [Codex in ChatGPT FAQ](https://help.openai.com/en/articles/11369540-codex-in-chatgpt-faq)
- [API authentication](https://platform.openai.com/docs/api-reference/authentication?api-mode=responses)
- [Quickstart: set up your API key](https://platform.openai.com/docs/quickstart/step-2-set-up-your-api-key)
- [Image generation guide](https://platform.openai.com/docs/guides/image-generation?lang=curl)
- [GPT Image 1.5 model page](https://platform.openai.com/docs/models/gpt-image-1.5)
