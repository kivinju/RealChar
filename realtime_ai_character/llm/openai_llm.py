import os
from typing import List

from langchain.agents import load_tools
from langchain.agents import initialize_agent
from langchain.agents import AgentType
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
if os.getenv('OPENAI_API_TYPE') == 'azure':
    from langchain.chat_models import AzureChatOpenAI
else:
    from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI
from langchain.schema import BaseMessage, HumanMessage

from realtime_ai_character.database.chroma import get_chroma
from realtime_ai_character.llm.base import AsyncCallbackAudioHandler, AsyncCallbackTextHandler, LLM
from realtime_ai_character.logger import get_logger
from realtime_ai_character.utils import Character

logger = get_logger(__name__)


class OpenaiLlm(LLM):
    def __init__(self, model):
        if os.getenv('OPENAI_API_TYPE') == 'azure':
            self.chat_open_ai = AzureChatOpenAI(
                deployment_name=os.getenv(
                    'OPENAI_API_MODEL_DEPLOYMENT_NAME', 'gpt-35-turbo'),
                model=model,
                temperature=0.5,
                streaming=True
            )
        else:
            self.chat_open_ai = ChatOpenAI(
                model=model,
                temperature=0.5,
                streaming=True
            )
        self.db = get_chroma()
        self.search_agent = None
        if os.getenv('SERPER_API_KEY'):
            llm = OpenAI(temperature=0)
            tools = load_tools(["google-serper"], llm=llm)
            self.search_agent = initialize_agent(
                tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION
            )

    async def achat(self,
                    history: List[BaseMessage],
                    user_input: str,
                    user_input_template: str,
                    callback: AsyncCallbackTextHandler,
                    audioCallback: AsyncCallbackAudioHandler,
                    character: Character,
                    useSearch: bool=False) -> str:
        # 1. Generate context
        context = self._generate_context(user_input, character)
        # Get search result if enabled
        if useSearch:
            if self.search_agent is None:
                logger.warning('Search is not enabled, please set SERPER_API_KEY to enable it.')
            else:
                search_result: str = self.search_agent.run(character.name + ' ' + user_input)
                search_context = 'Search input: ' + user_input + '\n' + 'Search result: ' + search_result
                logger.info(f'Search result: {search_context}')
                # Append to context
                context += '\n' + search_context
                # Add back to context store
                self.db.add_texts([search_context], [{
                    'character_name': character.name,
                }])

        # 2. Add user input to history
        history.append(HumanMessage(content=user_input_template.format(
            context=context, query=user_input)))

        # 3. Generate response
        response = await self.chat_open_ai.agenerate(
            [history], callbacks=[callback, audioCallback, StreamingStdOutCallbackHandler()])
        logger.info(f'Response: {response}')
        return response.generations[0][0].text

    def _generate_context(self, query, character: Character) -> str:
        docs = self.db.similarity_search(query)
        docs = [d for d in docs if d.metadata['character_name'] == character.name]
        logger.info(f'Found {len(docs)} documents')

        context = '\n'.join([d.page_content for d in docs])
        return context
