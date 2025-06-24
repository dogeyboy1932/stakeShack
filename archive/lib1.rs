#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");


#[program]
pub mod Journal {
    use super::*;
    pub fn create(ctx: Context<Create>, title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())     
    }

    pub fn update(ctx: Context<Update>, title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())     
    }

    pub fn delete(ctx: Context<Delete>, title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())     
    }
}



#[account]
#[dervice(INIT_SPACE)]
[in struct JournalEntry {
    pub owner: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}]


// npm run anchor build | test | localnet | deploy

#[derive(Accounts)]
#[instruction(owner: Pubkey, title: String)]
pub struct CreateEntry<'info> {
    
    // #[account(mut)]
    // pub owner: Signer<'info>,
    
    #[account(
        info, 
        seeds = [owner.key().as_ref(), title.as_bytes()],
        bump,
        space = INIT_SPACE
        payer = payer
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    
    #[account(mut)]
    pub payer: Signer<'info>,


    pub system_program: Program<'info, System>,
}



#[derive(Accounts)]
#[instruction(owner: Pubkey, title: String)]
pub struct UpdateEntry<'info> {
    
    #[account(
        mut, 
        seeds = [owner.key().as_ref(), title.as_bytes()],
        bump,
        realloc = JournalEntry::INIT_SPACE,
        realloc::payer = payer,
        realloc::zero = true,
        payer = payer
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    
    #[account(mut)]
    pub payer: Signer<'info>,


    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(owner: Pubkey, title: String)]
pub struct DeleteEntry<'info> {

    #[account(
        mut, 
        seeds = [owner.key().as_ref(), title.as_bytes()],
        bump,
        close = payer
    )]
    pub journal_entry: Account<'info, JournalEntry>,            

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}





















// #[program]
// pub mod counter {
//     use super::*;

//     pub fn close(_ctx: Context<CloseCounter>) -> Result<()> {
//         Ok(())
//     }

//     pub fn decrement(ctx: Context<Update>) -> Result<()> {
//         ctx.accounts.counter.count = ctx.accounts.counter.count.checked_sub(1).unwrap();
//         Ok(())
//     }

//     pub fn increment(ctx: Context<Update>) -> Result<()> {
//         ctx.accounts.counter.count = ctx.accounts.counter.count.checked_add(1).unwrap();
//         Ok(())
//     }

//     pub fn initialize(_ctx: Context<InitializeCounter>) -> Result<()> {
//         Ok(())
//     }

//     pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
//         ctx.accounts.counter.count = value.clone();
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct InitializeCounter<'info> {
//     #[account(mut)]
//     pub payer: Signer<'info>,

//     #[account(
//   init,
//   space = 8 + Counter::INIT_SPACE,
//   payer = payer
//     )]
//     pub counter: Account<'info, Counter>,
//     pub system_program: Program<'info, System>,
// }
// #[derive(Accounts)]
// pub struct CloseCounter<'info> {
//     #[account(mut)]
//     pub payer: Signer<'info>,

//     #[account(
//   mut,
//   close = payer, // close account and return lamports to payer
//     )]
//     pub counter: Account<'info, Counter>,
// }

// #[derive(Accounts)]
// pub struct Update<'info> {
//     #[account(mut)]
//     pub counter: Account<'info, Counter>,
// }

// #[account]
// #[derive(InitSpace)]
// pub struct Counter {
//     count: u8,
// }
