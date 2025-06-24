use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS"); // Replace with your program ID

// Fixed penalty wallet - replace with your actual penalty wallet address
const PENALTY_WALLET: &str = "2c8QGXM2tRMh7yb1Zva48ZmQTPMmLZCu159x2hscxxwv";

fn get_penalty_wallet() -> Pubkey {
    Pubkey::try_from(PENALTY_WALLET).unwrap()
}



#[program]
pub mod simple_escrow {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        owner: Pubkey,
    ) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.owner = owner;
        escrow_account.bump = ctx.bumps.escrow_account;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, EscrowError::InvalidAmount);

        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.staker = ctx.accounts.staker.key();
        stake_account.amount = amount;
        stake_account.is_active = true;
        stake_account.bump = ctx.bumps.stake_account;

        // Transfer SOL from staker to stake account (PDA)
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.staker.to_account_info(),
                to: ctx.accounts.stake_account.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        emit!(StakeCreated {
            staker: ctx.accounts.staker.key(),
            amount,
            stake_account: ctx.accounts.stake_account.key(),
        });

        Ok(())
    }

    pub fn slash_stake(ctx: Context<SlashStake>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let escrow_account = &ctx.accounts.escrow_account;

        require!(stake_account.is_active, EscrowError::StakeNotActive);
        require!(
            ctx.accounts.owner.key() == escrow_account.owner,
            EscrowError::UnauthorizedOwner
        );

        let amount = stake_account.amount;
        stake_account.is_active = false;

        // Transfer SOL from stake account to penalty wallet
        let seeds = &[
            b"stake",
            stake_account.staker.as_ref(),
            &[stake_account.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        **ctx.accounts.stake_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.penalty_wallet.to_account_info().try_borrow_mut_lamports()? += amount;

        emit!(StakeSlashed {
            staker: stake_account.staker,
            amount,
            penalty_wallet: get_penalty_wallet(),
        });

        Ok(())
    }

    pub fn resolve_stake(ctx: Context<ResolveStake>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let escrow_account = &ctx.accounts.escrow_account;

        require!(stake_account.is_active, EscrowError::StakeNotActive);
        require!(
            ctx.accounts.owner.key() == escrow_account.owner,
            EscrowError::UnauthorizedOwner
        );

        let amount = stake_account.amount;
        stake_account.is_active = false;

        // Transfer SOL back to staker
        let seeds = &[
            b"stake",
            stake_account.staker.as_ref(),
            &[stake_account.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        **ctx.accounts.stake_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.staker.to_account_info().try_borrow_mut_lamports()? += amount;

        emit!(StakeResolved {
            staker: stake_account.staker,
            amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [b"escrow"],
        bump,
        space = 8 + EscrowAccount::INIT_SPACE
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        init,
        payer = staker,
        seeds = [b"stake", staker.key().as_ref()],
        bump,
        space = 8 + StakeAccount::INIT_SPACE
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(mut)]
    pub staker: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SlashStake<'info> {
    #[account(
        mut,
        seeds = [b"stake", stake_account.staker.as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        seeds = [b"escrow"],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    pub owner: Signer<'info>,
    
    /// CHECK: This is the fixed penalty wallet
    #[account(
        mut,
        constraint = penalty_wallet.key() == get_penalty_wallet() @ EscrowError::InvalidPenaltyWallet
    )]
    pub penalty_wallet: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ResolveStake<'info> {
    #[account(
        mut,
        seeds = [b"stake", stake_account.staker.as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        seeds = [b"escrow"],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    pub owner: Signer<'info>,
    
    /// CHECK: This is the original staker
    #[account(mut)]
    pub staker: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct EscrowAccount {
    pub owner: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    pub staker: Pubkey,
    pub amount: u64,
    pub is_active: bool,
    pub bump: u8,
}

#[event]
pub struct StakeCreated {
    pub staker: Pubkey,
    pub amount: u64,
    pub stake_account: Pubkey,
}

#[event]
pub struct StakeSlashed {
    pub staker: Pubkey,
    pub amount: u64,
    pub penalty_wallet: Pubkey,
}

#[event]
pub struct StakeResolved {
    pub staker: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,
    #[msg("Stake is not active")]
    StakeNotActive,
    #[msg("Unauthorized: only the owner can perform this action")]
    UnauthorizedOwner,
    #[msg("Invalid penalty wallet: must match the fixed penalty wallet")]
    InvalidPenaltyWallet,
}