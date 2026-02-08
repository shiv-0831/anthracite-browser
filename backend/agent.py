import os
import logging

# Increase browser-use event timeouts for Electron CDP (must be set before import)
os.environ["TIMEOUT_BrowserStartEvent"] = "120"
os.environ["TIMEOUT_ScreenshotEvent"] = "30"

from browser_use import Agent, BrowserSession
from browser_use import ChatOpenAI
import asyncio

logger = logging.getLogger(__name__)

# Persistent browser session connected to Poseidon's Electron via CDP
_browser_session: BrowserSession | None = None


async def get_or_create_session(cdp_url: str) -> BrowserSession:
    """Get existing browser session or create one connected to Poseidon via CDP."""
    global _browser_session

    if _browser_session is not None:
        return _browser_session

    _browser_session = BrowserSession(
        cdp_url=cdp_url,
        keep_alive=True,
    )
    return _browser_session


async def _switch_to_agent_tab(session: BrowserSession):
    """Switch browser-use focus to the agent tab (about:blank), not the Poseidon UI."""
    try:
        state = await session.get_browser_state_summary()
        for tab in state.tabs:
            # Find the about:blank tab (our agent tab), skip the Poseidon UI
            if tab.url != "http://127.0.0.1:5173/" and "devtools://" not in tab.url:
                logger.info(f"Switching agent focus to tab: {tab.url} (target: {tab.target_id})")
                await session.get_or_create_cdp_session(tab.target_id, focus=True)
                return
        logger.warning("No suitable agent tab found, using current focus")
    except Exception as e:
        logger.error(f"Failed to switch to agent tab: {e}")


async def run_agent_task_logic(instruction: str, cdp_url: str = "http://127.0.0.1:9222"):
    """Run an agent task inside Poseidon's browser via CDP."""
    browser_session = await get_or_create_session(cdp_url)

    # Start the session if not already connected
    if browser_session._cdp_client_root is None:
        await browser_session.start()
        # Switch focus to the agent tab (not the Poseidon UI)
        await _switch_to_agent_tab(browser_session)

    agent = Agent(
        task=instruction,
        llm=ChatOpenAI(model="gpt-4o", api_key=os.getenv("OPENAI_API_KEY")),
        browser_session=browser_session,
    )

    result = await agent.run()
    return result.final_result or "Task Completed"


if __name__ == "__main__":
    asyncio.run(run_agent_task_logic("Go to google.com and search for 'Poseidon'"))
