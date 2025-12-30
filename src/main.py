import argparse
from .config import get_config
from .agent import AtlassianAgent


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Atlassian AI Assistant - Fetch and analyze Jira issues and Confluence pages",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Get Jira sprint issues
  python -m src.main jira

  # Get all Jira issues (not just sprints)
  python -m src.main jira --all-issues

  # Search Confluence
  python -m src.main confluence search "API documentation"

  # Read a Confluence page
  python -m src.main confluence read --title "Team Guidelines"

  # Ask Claude a custom question
  python -m src.main jira --question "Which issues are blocked?"
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Jira command
    jira_parser = subparsers.add_parser('jira', help='Fetch Jira issues')
    jira_parser.add_argument(
        '--board-id',
        type=int,
        help='Specific board ID to fetch issues from'
    )
    jira_parser.add_argument(
        '--all-issues',
        action='store_true',
        help='Get all issues, not just sprint issues'
    )
    jira_parser.add_argument(
        '--no-analyze',
        action='store_true',
        help='Skip Claude analysis'
    )
    jira_parser.add_argument(
        '--question',
        type=str,
        help='Custom question to ask Claude about the issues'
    )

    # Confluence command
    confluence_parser = subparsers.add_parser('confluence', help='Interact with Confluence')
    confluence_subparsers = confluence_parser.add_subparsers(dest='subcommand', help='Confluence subcommand')

    # Confluence search
    search_parser = confluence_subparsers.add_parser('search', help='Search Confluence pages')
    search_parser.add_argument(
        'query',
        type=str,
        help='Search query'
    )
    search_parser.add_argument(
        '--space',
        type=str,
        help='Limit search to specific space'
    )
    search_parser.add_argument(
        '--analyze',
        action='store_true',
        help='Analyze results with Claude'
    )
    search_parser.add_argument(
        '--question',
        type=str,
        help='Custom question to ask Claude'
    )

    # Confluence read
    read_parser = confluence_subparsers.add_parser('read', help='Read a Confluence page')
    read_parser.add_argument(
        '--page-id',
        type=str,
        help='Page ID'
    )
    read_parser.add_argument(
        '--title',
        type=str,
        help='Page title'
    )
    read_parser.add_argument(
        '--space',
        type=str,
        help='Space key (required if using --title)'
    )
    read_parser.add_argument(
        '--no-analyze',
        action='store_true',
        help='Skip Claude analysis'
    )
    read_parser.add_argument(
        '--question',
        type=str,
        help='Custom question to ask Claude about the page'
    )

    # Confluence recent
    recent_parser = confluence_subparsers.add_parser('recent', help='Get recently updated pages')
    recent_parser.add_argument(
        '--space',
        type=str,
        help='Limit to specific space'
    )
    recent_parser.add_argument(
        '--analyze',
        action='store_true',
        help='Analyze results with Claude'
    )

    return parser.parse_args()


def main():
    """Main entry point"""
    args = parse_args()

    # Validate configuration
    try:
        config = get_config()
    except ValueError as e:
        print(f"\nConfiguration Error: {e}")
        print("\nPlease ensure you have:")
        print("1. Created a .env file (copy from .env.example)")
        print("2. Set all required environment variables")
        print("3. See .env.example for required variables")
        return 1

    agent = AtlassianAgent(config)

    try:
        if not args.command:
            print("Error: Please specify a command (jira or confluence)")
            print("Run with --help for usage information")
            return 1

        # Execute Jira command
        if args.command == 'jira':
            agent.run_jira_workflow(
                board_id=args.board_id,
                sprint_only=not args.all_issues,
                analyze=not args.no_analyze,
                question=args.question
            )

        # Execute Confluence commands
        elif args.command == 'confluence':
            if not args.subcommand:
                print("Error: Please specify a confluence subcommand (search, read, or recent)")
                return 1

            if args.subcommand == 'search':
                agent.run_confluence_search(
                    query=args.query,
                    space_key=args.space,
                    analyze=args.analyze,
                    question=args.question
                )

            elif args.subcommand == 'read':
                if not args.page_id and not args.title:
                    print("Error: Either --page-id or --title must be provided")
                    return 1

                if args.title and not args.space:
                    # Use default space from config if not provided
                    args.space = config.confluence_space_key

                agent.run_confluence_read(
                    page_id=args.page_id,
                    title=args.title,
                    space_key=args.space,
                    analyze=not args.no_analyze,
                    question=args.question
                )

            elif args.subcommand == 'recent':
                pages_summary = agent.get_recent_confluence_pages(
                    space_key=args.space
                )
                print("\n" + "=" * 60)
                print("RECENT CONFLUENCE PAGES")
                print("=" * 60)
                print(pages_summary)

                if args.analyze:
                    print("\n" + "=" * 60)
                    print("CLAUDE'S ANALYSIS")
                    print("=" * 60)
                    analysis = agent.analyze_with_claude(
                        pages_summary,
                        content_type="confluence"
                    )
                    print(analysis)
                    print("=" * 60)

        return 0

    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        return 130
    except Exception as e:
        print(f"\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
